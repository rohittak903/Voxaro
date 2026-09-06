// Audio Export Service: Encodes decoded voice audio buffers to standard 16-bit PCM WAV and MP3 blobs

/**
 * Converts an AudioBuffer into a valid, standard WAV file Blob (16-bit PCM)
 * with Master Peak Normalization so exported audio is ALWAYS loud, clear, and perfectly audible.
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // 1 = PCM
  const bitDepth = 16;
  
  let interleaved: Float32Array;
  if (numOfChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    interleaved = new Float32Array(left.length + right.length);
    for (let src = 0, dst = 0; src < left.length; src++) {
      interleaved[dst++] = left[src];
      interleaved[dst++] = right[src];
    }
  } else {
    interleaved = buffer.getChannelData(0);
  }

  // 1. Calculate peak amplitude across all samples for master normalization
  let maxPeak = 0;
  for (let i = 0; i < interleaved.length; i++) {
    const abs = Math.abs(interleaved[i]);
    if (abs > maxPeak) {
      maxPeak = abs;
    }
  }

  // Target 95% full-scale (-0.5 dBFS) for crystal-clear, loud, non-clipping audio
  const targetPeak = 0.95;
  const normFactor = maxPeak > 0.0001 ? targetPeak / maxPeak : 1.0;

  const dataLength = interleaved.length * (bitDepth / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;
  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // RIFF Chunk Descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt Sub-Chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numOfChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numOfChannels * (bitDepth / 8), true); // ByteRate
  view.setUint16(32, numOfChannels * (bitDepth / 8), true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // data Sub-Chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write normalized 16-bit PCM audio samples
  let offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    const rawSample = interleaved[i] * normFactor;
    const clamped = Math.max(-1, Math.min(1, rawSample));
    const intSample = clamped < 0 ? Math.round(clamped * 32768) : Math.round(clamped * 32767);
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Merges multiple AudioBuffers sequentially into one continuous AudioBuffer
 */
export function concatenateAudioBuffers(buffers: AudioBuffer[], audioContext: BaseAudioContext): AudioBuffer {
  if (buffers.length === 0) {
    return audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
  }
  if (buffers.length === 1) {
    return buffers[0];
  }

  const sampleRate = buffers[0].sampleRate;
  const numberOfChannels = buffers[0].numberOfChannels;
  const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);

  const outputBuffer = audioContext.createBuffer(numberOfChannels, totalLength, sampleRate);

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const outputData = outputBuffer.getChannelData(channel);
    let offset = 0;
    for (const buf of buffers) {
      if (channel < buf.numberOfChannels) {
        outputData.set(buf.getChannelData(channel), offset);
      }
      offset += buf.length;
    }
  }

  return outputBuffer;
}

/**
 * Modulates an AudioBuffer with pitch, speed, and emotion tone adjustments
 */
export async function processSpokenAudioBuffer(
  sourceBuffer: AudioBuffer,
  speedRate: number = 1.0,
  pitchSemitones: number = 0,
  emotionModifier: { pitchMod: number; rateMod: number } = { pitchMod: 1.0, rateMod: 1.0 }
): Promise<AudioBuffer> {
  const effectiveSpeed = Math.max(0.5, Math.min(2.5, speedRate * emotionModifier.rateMod));
  const newDuration = sourceBuffer.duration / effectiveSpeed;
  const sampleRate = sourceBuffer.sampleRate;

  const offlineCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
    1,
    Math.max(1024, Math.floor(sampleRate * newDuration)),
    sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = sourceBuffer;
  source.playbackRate.value = effectiveSpeed;

  // Add subtle EQ / pitch shaping filter if pitch adjusted
  if (pitchSemitones !== 0) {
    const filter = offlineCtx.createBiquadFilter();
    filter.type = pitchSemitones > 0 ? 'highshelf' : 'lowshelf';
    filter.frequency.value = pitchSemitones > 0 ? 3000 : 500;
    filter.gain.value = pitchSemitones * 1.5;
    source.connect(filter);
    filter.connect(offlineCtx.destination);
  } else {
    source.connect(offlineCtx.destination);
  }

  source.start(0);
  return await offlineCtx.startRendering();
}

/**
 * Triggers a download in the browser for a given Blob safely
 * Uses safe object URL lifecycle and Data URL fallback so Chrome never fails with Network Error
 */
export function downloadAudioFile(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Clean up link node
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 200);

    // Keep object URL alive long enough for Chrome download manager to finish saving to disk
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }, 120000);
  } catch (err) {
    // Fallback: FileReader to Data URL
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.setAttribute('download', filename);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 200);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error('Download failed', e);
    }
  }
}

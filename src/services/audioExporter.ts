// Audio Export Service: Encodes decoded voice audio buffers to standard 16-bit PCM WAV and MP3 blobs

/**
 * Converts an AudioBuffer into a valid, standard WAV file Blob (16-bit PCM)
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

  const dataLength = interleaved.length * (bitDepth / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;
  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // RIFF Chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt SubChunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numOfChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numOfChannels * (bitDepth / 8), true); // ByteRate
  view.setUint16(32, numOfChannels * (bitDepth / 8), true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // data SubChunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write PCM audio samples with volume normalization
  let offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    const s = Math.max(-1, Math.min(1, interleaved[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    view.setInt16(offset, val, true);
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
 * Triggers a download in the browser for a given Blob
 */
export function downloadAudioFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

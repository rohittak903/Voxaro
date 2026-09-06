import { ApiKey, ApiKeyScope } from '../types';
import { VOICES } from '../data/voices';
import { AudioSynthesisEngine } from './audioSynthesizer';

export interface ApiEndpointDoc {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  requestBodySchema?: Record<string, any>;
  sampleRequestBody?: Record<string, any>;
  responseSchema?: Record<string, any>;
  sampleResponse?: Record<string, any>;
}

export const API_ENDPOINTS: ApiEndpointDoc[] = [
  {
    id: 'tts-generate',
    name: 'Synthesize Text to Speech',
    method: 'POST',
    path: '/api/v1/tts/generate',
    description: 'Converts written text into high-fidelity AI speech audio with customizable voice, speed, pitch, and emotional tone.',
    sampleRequestBody: {
      text: 'Welcome to our website! This audio was generated automatically using Voxaro.',
      voice_id: 'voice-en-us-emma',
      speed: 1.0,
      pitch: 0,
      tone: 'neutral',
      format: 'wav',
      stream: false
    },
    sampleResponse: {
      status: 'success',
      job_id: 'job-98427184',
      audio_url: 'https://cdn.voxaro.ai/audio/generated_voice_sample.wav',
      duration: 3.8,
      character_count: 81,
      format: 'wav',
      voice: {
        id: 'voice-en-us-emma',
        name: 'Emma',
        language: 'English (US)',
        gender: 'female'
      },
      created_at: '2026-09-06T12:00:00Z'
    }
  },
  {
    id: 'voices-list',
    name: 'List Available AI Voices',
    method: 'GET',
    path: '/api/v1/voices',
    description: 'Retrieves a list of all 25+ AI voice models with supported languages, genders, styles, and preview sample clips.',
    sampleResponse: {
      status: 'success',
      total_count: 26,
      voices: VOICES.slice(0, 5).map(v => ({
        id: v.id,
        name: v.name,
        language: v.language,
        lang_code: v.langCode,
        gender: v.gender,
        style: v.style,
        accent: v.accent,
        is_premium: v.isPremium,
        sample_text: v.sampleText
      }))
    }
  },
  {
    id: 'usage-check',
    name: 'Check Account Usage & Quota',
    method: 'GET',
    path: '/api/v1/usage',
    description: 'Returns your current character quota, monthly usage statistics, and remaining synthesis balance.',
    sampleResponse: {
      status: 'success',
      plan: 'creator',
      monthly_character_limit: 100000,
      characters_used_this_month: 23800,
      remaining_characters: 76200,
      reset_date: '2026-10-01T00:00:00Z',
      rate_limit_rpm: 120
    }
  }
];

export class ApiService {
  /**
   * Generates a new cryptographically randomized API key
   */
  static generateApiKey(name: string, environment: 'live' | 'test', scope: ApiKeyScope = 'full_access'): ApiKey {
    const prefix = environment === 'live' ? 'vx_live_' : 'vx_test_';
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return {
      id: 'key-' + Date.now(),
      name: name.trim() || (environment === 'live' ? 'Production Key' : 'Development Test Key'),
      key: `${prefix}${randomHex}`,
      prefix,
      scope,
      environment,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      requestsCount: 0,
      charsProcessed: 0,
      status: 'active'
    };
  }

  /**
   * Generates production code snippets for any language
   */
  static getCodeSnippet(
    language: 'curl' | 'javascript' | 'nodejs' | 'python' | 'php' | 'go',
    endpoint: ApiEndpointDoc,
    apiKeyStr: string,
    customBody?: Record<string, any>
  ): string {
    const key = apiKeyStr || 'vx_live_YOUR_API_KEY_HERE';
    const baseUrl = 'https://api.voxaro.ai';
    const fullUrl = `${baseUrl}${endpoint.path}`;
    const bodyObj = customBody || endpoint.sampleRequestBody || {};
    const jsonBodyStr = JSON.stringify(bodyObj, null, 2);

    switch (language) {
      case 'curl':
        if (endpoint.method === 'GET') {
          return `curl -X GET "${fullUrl}" \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json"`;
        }
        return `curl -X POST "${fullUrl}" \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(bodyObj)}'`;

      case 'javascript':
        if (endpoint.method === 'GET') {
          return `// Client-side / Web JavaScript Fetch
const response = await fetch("${fullUrl}", {
  method: "GET",
  headers: {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json"
  }
});

const data = await response.json();
console.log(data);`;
        }
        return `// Client-side / Web JavaScript Fetch
const response = await fetch("${fullUrl}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${jsonBodyStr})
});

const result = await response.json();
console.log("Audio URL:", result.audio_url);

// Play directly in browser:
const audio = new Audio(result.audio_url);
audio.play();`;

      case 'nodejs':
        if (endpoint.method === 'GET') {
          return `// Node.js (Axios / Native Fetch)
import axios from 'axios';

const response = await axios.get('${fullUrl}', {
  headers: {
    'Authorization': 'Bearer ${key}',
    'Content-Type': 'application/json'
  }
});

console.log(response.data);`;
        }
        return `// Node.js (Audio Synthesis & File Export)
import axios from 'axios';
import fs from 'fs';

async function generateVoice() {
  const response = await axios.post('${fullUrl}', ${jsonBodyStr}, {
    headers: {
      'Authorization': 'Bearer ${key}',
      'Content-Type': 'application/json'
    }
  });

  console.log('Synthesized in:', response.data.duration, 'seconds');
  console.log('Download URL:', response.data.audio_url);
}

generateVoice();`;

      case 'python':
        if (endpoint.method === 'GET') {
          return `# Python 3 (requests)
import requests

url = "${fullUrl}"
headers = {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
print(response.json())`;
        }
        return `# Python 3 (Text-to-Speech API)
import requests

url = "${fullUrl}"
headers = {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json"
}

payload = ${JSON.stringify(bodyObj, null, 4)}

response = requests.post(url, headers=headers, json=payload)
data = response.json()

print(f"Generated Audio URL: {data['audio_url']}")
print(f"Duration: {data['duration']}s")`;

      case 'php':
        if (endpoint.method === 'GET') {
          return `<?php
// PHP cURL
$ch = curl_init("${fullUrl}");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ${key}',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
?>`;
        }
        return `<?php
// PHP cURL Text to Speech
$ch = curl_init("${fullUrl}");
$payload = json_encode(${jsonBodyStr});

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ${key}',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
echo "Audio URL: " . $result['audio_url'];
?>`;

      case 'go':
        return `// Go (Golang)
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	url := "${fullUrl}"
	reqBody, _ := json.Marshal(${jsonBodyStr})

	req, _ := http.NewRequest("${endpoint.method}", url, bytes.NewBuffer(reqBody))
	req.Header.Set("Authorization", "Bearer ${key}")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	fmt.Println("Response status:", resp.Status)
}`;

      default:
        return `// Language not supported`;
    }
  }

  /**
   * Executes a live playground test in the browser
   */
  static async executePlaygroundRequest(
    endpoint: ApiEndpointDoc,
    apiKey: string,
    body: Record<string, any>
  ): Promise<{
    statusCode: number;
    statusText: string;
    responseTimeMs: number;
    headers: Record<string, string>;
    data: any;
    playableAudioBlob?: Blob;
    playableAudioUrl?: string;
  }> {
    const startTime = performance.now();

    // 1. Basic Key Auth validation
    if (!apiKey || !apiKey.startsWith('vx_')) {
      await new Promise(r => setTimeout(r, 120));
      return {
        statusCode: 401,
        statusText: 'Unauthorized',
        responseTimeMs: Math.round(performance.now() - startTime),
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-ratelimit-limit': '120',
          'x-ratelimit-remaining': '119'
        },
        data: {
          error: {
            code: 'invalid_api_key',
            message: 'The provided API key is invalid or missing. Ensure you pass "Authorization: Bearer vx_live_..." header.'
          }
        }
      };
    }

    // 2. Route Handling
    if (endpoint.id === 'voices-list') {
      await new Promise(r => setTimeout(r, 180));
      return {
        statusCode: 200,
        statusText: 'OK',
        responseTimeMs: Math.round(performance.now() - startTime),
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-ratelimit-limit': '120',
          'x-ratelimit-remaining': '118'
        },
        data: {
          status: 'success',
          total_count: VOICES.length,
          voices: VOICES.map(v => ({
            id: v.id,
            name: v.name,
            language: v.language,
            lang_code: v.langCode,
            gender: v.gender,
            style: v.style,
            accent: v.accent,
            is_premium: v.isPremium,
            sample_text: v.sampleText
          }))
        }
      };
    }

    if (endpoint.id === 'usage-check') {
      await new Promise(r => setTimeout(r, 140));
      return {
        statusCode: 200,
        statusText: 'OK',
        responseTimeMs: Math.round(performance.now() - startTime),
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-ratelimit-limit': '120',
          'x-ratelimit-remaining': '117'
        },
        data: {
          status: 'success',
          plan: 'pro',
          monthly_character_limit: 500000,
          characters_used_this_month: 14250,
          remaining_characters: 485750,
          reset_date: new Date(Date.now() + 25 * 86400000).toISOString(),
          rate_limit_rpm: 300
        }
      };
    }

    // TTS Generation Endpoint
    if (endpoint.id === 'tts-generate') {
      const text = body.text || 'Welcome to Voxaro API integration test!';
      const voiceId = body.voice_id || 'voice-en-us-emma';
      const voice = VOICES.find(v => v.id === voiceId) || VOICES[0];
      const speed = body.speed || 1.0;
      const pitch = body.pitch || 0;
      const tone = body.tone || 'neutral';

      // Perform real offline synthesis to generate actual playable audio!
      const synthesis = await AudioSynthesisEngine.synthesizeJob(
        text,
        voice,
        speed,
        pitch,
        tone
      );

      const endTime = performance.now();

      return {
        statusCode: 200,
        statusText: 'OK',
        responseTimeMs: Math.round(endTime - startTime),
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-audio-duration': synthesis.duration.toFixed(2) + 's',
          'x-ratelimit-limit': '120',
          'x-ratelimit-remaining': '115'
        },
        data: {
          status: 'success',
          job_id: 'job-' + Date.now(),
          audio_url: synthesis.audioUrl,
          duration: synthesis.duration,
          character_count: text.length,
          format: body.format || 'wav',
          voice: {
            id: voice.id,
            name: voice.name,
            language: voice.language,
            gender: voice.gender
          },
          created_at: new Date().toISOString()
        },
        playableAudioBlob: synthesis.audioBlob,
        playableAudioUrl: synthesis.audioUrl
      };
    }

    return {
      statusCode: 404,
      statusText: 'Not Found',
      responseTimeMs: Math.round(performance.now() - startTime),
      headers: { 'content-type': 'application/json' },
      data: { error: 'Endpoint not found' }
    };
  }
}

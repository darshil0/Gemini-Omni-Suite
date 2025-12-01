// services/audioUtils.ts - Fixed audio processing utilities

import { API_CONFIG } from '../constants';

/**
 * Convert Float32Array audio data to PCM16 blob
 */
export function createPcmBlob(audioData: Float32Array): Blob {
  const pcm16 = float32ToPcm16(audioData);
  return new Blob([pcm16], { type: 'audio/pcm' });
}

/**
 * Convert Float32Array to PCM16 format
 */
function float32ToPcm16(float32Array: Float32Array): Int16Array {
  const pcm16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp values between -1 and 1
    const clamped = Math.max(-1, Math.min(1, float32Array[i]));
    // Convert to 16-bit PCM
    pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
  }
  return pcm16;
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    console.error('Failed to decode base64:', error);
    throw new Error('Invalid base64 string');
  }
}

/**
 * Convert Uint8Array to base64 string
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert PCM16 to Float32Array
 */
export function pcm16ToFloat32(pcm16: Int16Array): Float32Array {
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF);
  }
  return float32;
}

/**
 * Resample audio data
 */
export function resampleAudio(
  audioData: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number = API_CONFIG.AUDIO_SAMPLE_RATE
): Float32Array {
  if (sourceSampleRate === targetSampleRate) {
    return audioData;
  }

  const ratio = sourceSampleRate / targetSampleRate;
  const newLength = Math.floor(audioData.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const sourceIndex = i * ratio;
    const index = Math.floor(sourceIndex);
    const fraction = sourceIndex - index;

    if (index + 1 < audioData.length) {
      // Linear interpolation
      result[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
    } else {
      result[i] = audioData[index];
    }
  }

  return result;
}

/**
 * Calculate RMS (Root Mean Square) volume
 */
export function calculateRMS(audioData: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i];
  }
  return Math.sqrt(sum / audioData.length);
}

/**
 * Apply gain to audio data
 */
export function applyGain(audioData: Float32Array, gain: number): Float32Array {
  const result = new Float32Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    result[i] = Math.max(-1, Math.min(1, audioData[i] * gain));
  }
  return result;
}

/**
 * Detect silence in audio data
 */
export function isSilence(audioData: Float32Array, threshold: number = 0.01): boolean {
  const rms = calculateRMS(audioData);
  return rms < threshold;
}

/**
 * Get audio analyzer frequencies
 */
export function getFrequencies(
  analyser: AnalyserNode,
  frequencyData: Uint8Array
): Uint8Array {
  analyser.getByteFrequencyData(frequencyData);
  return frequencyData;
}

/**
 * Create audio context with proper sample rate
 */
export async function createAudioContext(
  sampleRate: number = API_CONFIG.AUDIO_SAMPLE_RATE
): Promise<AudioContext> {
  const context = new AudioContext({ sampleRate });
  
  // Resume context if suspended (for iOS/Safari)
  if (context.state === 'suspended') {
    await context.resume();
  }
  
  return context;
}

/**
 * Request microphone access
 */
export async function requestMicrophoneAccess(): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: API_CONFIG.AUDIO_CHANNELS,
        sampleRate: API_CONFIG.AUDIO_SAMPLE_RATE,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    return stream;
  } catch (error) {
    console.error('Microphone access denied:', error);
    throw new Error('Could not access microphone');
  }
}

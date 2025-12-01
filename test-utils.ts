// test-utils.ts - Comprehensive testing utilities

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { EmailAnalysisResult, ImageEditResult } from './types';

// Mock Email Analysis Result
export const mockEmailAnalysisResult: EmailAnalysisResult = {
  category: 'Urgent',
  priority: 'High',
  actionItems: ['Respond by EOD', 'Schedule follow-up meeting'],
  draftResponse: 'Thank you for your email. I will address this immediately.',
  sentiment: 'Neutral',
  confidence: 92
};

// Mock Image Edit Result
export const mockImageEditResult: ImageEditResult = {
  dataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  mimeType: 'image/png',
  timestamp: Date.now()
};

// Mock Gemini API Response
export const createMockGeminiResponse = (text: string) => ({
  response: {
    text: () => text,
    functionCalls: () => [],
    candidates: []
  }
});

// Mock Audio Data
export function createMockAudioData(length: number = 1024): Float32Array {
  const data = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    data[i] = Math.sin(i * 0.1) * 0.5;
  }
  return data;
}

// Mock Image File
export function createMockImageFile(
  size: number = 1024 * 1024,
  type: string = 'image/png'
): File {
  const buffer = new ArrayBuffer(size);
  const blob = new Blob([buffer], { type });
  return new File([blob], 'test-image.png', { type });
}

// Mock WebSocket
export class MockWebSocket {
  url: string;
  readyState: number = WebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => this.simulateOpen(), 100);
  }

  send(data: string | ArrayBuffer | Blob): void {
    if (this.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
  }

  close(): void {
    this.readyState = WebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = WebSocket.CLOSED;
      if (this.onclose) {
        this.onclose(new CloseEvent('close'));
      }
    }, 100);
  }

  private simulateOpen(): void {
    this.readyState = WebSocket.OPEN;
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }

  simulateMessage(data: unknown): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }));
    }
  }

  simulateError(): void {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
}

// Mock Audio Context
export class MockAudioContext {
  sampleRate: number;
  state: AudioContextState = 'running';

  constructor(options?: AudioContextOptions) {
    this.sampleRate = options?.sampleRate || 48000;
  }

  async resume(): Promise<void> {
    this.state = 'running';
  }

  async suspend(): Promise<void> {
    this.state = 'suspended';
  }

  async close(): Promise<void> {
    this.state = 'closed';
  }

  createAnalyser(): AnalyserNode {
    return {
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 255);
        }
      }
    } as AnalyserNode;
  }

  createMediaStreamSource(stream: MediaStream): MediaStreamAudioSourceNode {
    return {} as MediaStreamAudioSourceNode;
  }
}

// Mock Media Devices
export const mockMediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: () => [
      {
        kind: 'audio',
        stop: vi.fn()
      }
    ],
    getAudioTracks: () => [
      {
        stop: vi.fn()
      }
    ]
  })
};

// Setup test environment
export function setupTestEnvironment() {
  beforeEach(() => {
    // Mock environment variables
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');

    // Mock global objects
    global.WebSocket = MockWebSocket as any;
    global.AudioContext = MockAudioContext as any;
    
    if (typeof navigator !== 'undefined') {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: mockMediaDevices,
        writable: true
      });
    }

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });
}

// Test helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Assertion helpers
export function assertEmailAnalysis(result: EmailAnalysisResult) {
  expect(result).toHaveProperty('category');
  expect(result).toHaveProperty('priority');
  expect(result).toHaveProperty('actionItems');
  expect(Array.isArray(result.actionItems)).toBe(true);
  expect(result).toHaveProperty('draftResponse');
  expect(result).toHaveProperty('confidence');
  expect(result.confidence).toBeGreaterThanOrEqual(0);
  expect(result.confidence).toBeLessThanOrEqual(100);
}

export function assertImageEdit(result: ImageEditResult) {
  expect(result).toHaveProperty('dataUri');
  expect(result.dataUri).toMatch(/^data:image\//);
  expect(result).toHaveProperty('mimeType');
  expect(result).toHaveProperty('timestamp');
  expect(result.timestamp).toBeGreaterThan(0);
}

// Example test suite
export const exampleTests = () => {
  describe('Audio Utils', () => {
    it('should convert Float32Array to PCM16', () => {
      const input = new Float32Array([0.5, -0.5, 1.0, -1.0]);
      // Test implementation here
    });

    it('should handle base64 encoding/decoding', () => {
      const input = new Uint8Array([1, 2, 3, 4, 5]);
      // Test implementation here
    });

    it('should calculate RMS correctly', () => {
      const input = createMockAudioData(1024);
      // Test implementation here
    });
  });

  describe('Gemini Service', () => {
    setupTestEnvironment();

    it('should analyze email successfully', async () => {
      // Test implementation here
    });

    it('should handle API errors gracefully', async () => {
      // Test implementation here
    });

    it('should retry failed requests', async () => {
      // Test implementation here
    });

    it('should respect rate limits', async () => {
      // Test implementation here
    });
  });

  describe('Image Editor', () => {
    setupTestEnvironment();

    it('should validate image file size', async () => {
      const largeFile = createMockImageFile(20 * 1024 * 1024); // 20MB
      // Test implementation here
    });

    it('should validate image MIME type', async () => {
      const invalidFile = createMockImageFile(1024, 'text/plain');
      // Test implementation here
    });
  });

  describe('Voice Assistant', () => {
    setupTestEnvironment();

    it('should establish WebSocket connection', async () => {
      // Test implementation here
    });

    it('should handle connection errors', async () => {
      // Test implementation here
    });

    it('should process audio chunks', async () => {
      const audioData = createMockAudioData();
      // Test implementation here
    });
  });
};

// Performance testing helpers
export function measurePerformance<T>(
  fn: () => T | Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve) => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`${label}: ${duration.toFixed(2)}ms`);
    resolve({ result, duration });
  });
}

// Load testing helper
export async function loadTest(
  fn: () => Promise<any>,
  iterations: number,
  concurrency: number = 1
): Promise<{ success: number; failure: number; avgDuration: number }> {
  const results = { success: 0, failure: 0, totalDuration: 0 };
  const chunks = Math.ceil(iterations / concurrency);

  for (let i = 0; i < chunks; i++) {
    const promises = [];
    const remaining = Math.min(concurrency, iterations - i * concurrency);

    for (let j = 0; j < remaining; j++) {
      promises.push(
        measurePerformance(fn, `Request ${i * concurrency + j}`)
          .then(({ duration }) => {
            results.success++;
            results.totalDuration += duration;
          })
          .catch(() => {
            results.failure++;
          })
      );
    }

    await Promise.all(promises);
  }

  return {
    ...results,
    avgDuration: results.totalDuration / results.success
  };
}

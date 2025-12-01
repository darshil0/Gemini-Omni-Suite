// Core Types for Gemini Omni-Suite

export interface EmailAnalysisResult {
  category: 'Urgent' | 'Important' | 'Social' | 'Personal' | 'Spam';
  priority: 'High' | 'Medium' | 'Low';
  actionItems: string[];
  draftResponse: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  confidence: number;
}

export interface EmailAnalysisError {
  error: string;
  code: 'API_ERROR' | 'INVALID_INPUT' | 'NETWORK_ERROR' | 'RATE_LIMIT';
}

export interface ImageEditRequest {
  image: File | Blob;
  prompt: string;
}

export interface ImageEditResult {
  dataUri: string;
  mimeType: string;
  timestamp: number;
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon?: string;
}

export interface VoiceSessionState {
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  error?: string;
  latency?: number;
}

export interface AudioVisualizerData {
  frequencies: Uint8Array;
  volume: number;
  isActive: boolean;
}

export type ThemeMode = 'dark' | 'light';

export interface AppConfig {
  apiKey: string;
  modelIds: {
    text: string;
    image: string;
    voice: string;
  };
  maxRetries: number;
  timeout: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// WebSocket message types for Live API
export interface LiveApiMessage {
  type: 'audio' | 'text' | 'control' | 'error';
  payload: unknown;
  timestamp: number;
}

export interface AudioChunk {
  data: ArrayBuffer;
  sampleRate: number;
  channels: number;
}

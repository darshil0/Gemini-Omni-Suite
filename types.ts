export enum AppView {
  EMAIL_AGENT = 'EMAIL_AGENT',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT',
}

export interface EmailAnalysisResult {
  raw: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  image?: string;
  timestamp: Date;
}

// Audio Types for Live API
export type PCMFloat32Data = Float32Array;

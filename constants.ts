// Constants for Gemini Omni-Suite

export const MODEL_IDS = {
  TEXT: 'gemini-2.0-flash-exp',
  IMAGE: 'gemini-2.0-flash-exp',
  VOICE: 'gemini-2.0-flash-exp'
} as const;

export const EMAIL_SYSTEM_PROMPT = `You are an intelligent email analysis assistant. Analyze the provided email and respond with:

1. Category: Choose from Urgent, Important, Social, Personal, or Spam
2. Priority: High, Medium, or Low
3. Action Items: Extract specific tasks or follow-ups needed (list format)
4. Draft Response: If category is Urgent, draft a professional response
5. Sentiment: Positive, Neutral, or Negative
6. Confidence: Your confidence level (0-100)

Format your response as JSON with these exact keys: category, priority, actionItems (array), draftResponse, sentiment, confidence.`;

export const IMAGE_EDIT_SYSTEM_PROMPT = `You are an expert image editor. Apply the requested modifications to the image with high fidelity. Focus on:
- Preserving important details
- Maintaining visual quality
- Following the prompt accurately
- Creating natural-looking results`;

export const VOICE_SYSTEM_PROMPT = `You are a helpful voice assistant. Provide concise, natural conversational responses. Keep answers brief and to the point unless more detail is requested.`;

export const QUICK_ACTIONS = [
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    prompt: 'Transform this image into a cyberpunk neon style with vibrant pink and blue lighting'
  },
  {
    id: 'sketch',
    label: 'Sketch',
    prompt: 'Convert this image into a detailed pencil sketch drawing'
  },
  {
    id: 'watercolor',
    label: 'Watercolor',
    prompt: 'Transform this into a soft watercolor painting'
  },
  {
    id: 'vintage',
    label: 'Vintage',
    prompt: 'Apply a vintage film photography effect with warm tones'
  },
  {
    id: 'remove-bg',
    label: 'Remove Background',
    prompt: 'Remove the background from this image, keeping only the main subject'
  },
  {
    id: 'enhance',
    label: 'Enhance',
    prompt: 'Enhance the image quality, increase sharpness and vibrance'
  }
] as const;

export const CATEGORY_COLORS = {
  Urgent: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  Important: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  Social: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  Personal: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  Spam: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' }
} as const;

export const API_CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT: 30000,
  RATE_LIMIT_DELAY: 1000,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  AUDIO_SAMPLE_RATE: 16000,
  AUDIO_CHANNELS: 1
} as const;

export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.',
  NETWORK_ERROR: 'Network error occurred. Please check your connection and try again.',
  RATE_LIMIT: 'Rate limit exceeded. Please wait a moment and try again.',
  INVALID_IMAGE: 'Invalid image format. Please use JPEG, PNG, or WebP.',
  IMAGE_TOO_LARGE: 'Image file is too large. Maximum size is 10MB.',
  MICROPHONE_ERROR: 'Could not access microphone. Please check permissions.',
  WEBSOCKET_ERROR: 'WebSocket connection failed. Please try again.'
} as const;

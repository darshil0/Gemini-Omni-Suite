# Gemini Omni-Suite

> **Version:** 1.1.0  
> **Status:** Stable  
> **Engine:** Google Gemini 2.5 (Flash, Flash Image, Live API)

## 📖 Overview

Gemini Omni-Suite is a next-generation multi-modal AI workspace designed to demonstrate the cohesive power of the Gemini 2.5 ecosystem. It integrates three distinct capabilities into a unified, glassmorphic React interface:

1.  **Text Intelligence**: Advanced email classification and response drafting.
2.  **Vision Manipulation**: Natural language image editing.
3.  **Real-time Audio**: Low-latency, bidirectional conversational AI.

---

## 🚀 Features & Walkthrough

### 1. Intelligent Email Agent
**Model:** `gemini-2.5-flash`

*   **Functionality**: Analyzes raw email text to determine category (Urgent, Important, Social), priority level, and extracts key action items. It automatically drafts professional responses for urgent inquiries.
*   **Walkthrough**:
    1.  Navigate to the **Email Agent** tab.
    2.  Paste raw email content into the left-hand glass panel.
    3.  Click the **Analyze Email** button.
    4.  Review the **Intelligence Report** on the right, which highlights the recommended folder and drafted response.
*   **Visual Reference**:
    > ![Email Agent Screenshot](docs/screenshots/email_agent_demo.png)  
    > *Description: Split-screen view showing raw input on the left and structured Markdown analysis on the right.*

### 2. Magic Image Editor
**Model:** `gemini-2.5-flash-image`

*   **Functionality**: Allows users to modify existing images using natural language prompts and download the results.
*   **Walkthrough**:
    1.  Navigate to the **Image Editor** tab.
    2.  Click the "Original Source" area to **upload an image** (JPG/PNG).
    3.  Type a creative prompt in the bottom bar (e.g., *"Add a futuristic neon city background"*).
    4.  Click **Generate**.
    5.  The AI-edited version appears in the "Generated Result" panel.
    6.  Click the **Download** button in the header of the result panel to save the edited image.
*   **Visual Reference**:
    > ![Image Editor Screenshot](docs/screenshots/image_editor_demo.png)  
    > *Description: Side-by-side comparison of the uploaded image and the AI-transformed result.*

### 3. Live Voice Assistant
**Model:** `gemini-2.5-flash-native-audio-preview`

*   **Functionality**: A real-time voice interface that uses the Live API for continuous, interruptible conversation.
*   **Walkthrough**:
    1.  Navigate to the **Live Voice** tab.
    2.  Click the central **Microphone** button to initiate the WebSocket connection.
    3.  Speak naturally to the AI. The visualizer bars will react to the model's voice output.
    4.  Tap the button again to disconnect the session.
*   **Visual Reference**:
    > ![Voice Assistant Screenshot](docs/screenshots/voice_assistant_demo.png)  
    > *Description: Active session state showing the glowing connection indicator and real-time audio frequency visualization.*

---

## 🧪 Testing Strategy

The quality assurance strategy follows a pyramid approach, ensuring reliability from individual functions up to user experience.

### 1. Unit Test Cases (Jest/Vitest)

| ID | Component / Function | Test Scenario | Input | Expected Result |
|:---|:---|:---|:---|:---|
| **UT-01** | `services/audioUtils` | `createPcmBlob` audio conversion | `Float32Array` (Silent) | Returns valid Base64 string representing PCM silence |
| **UT-02** | `services/audioUtils` | `base64ToUint8Array` decoding | Valid Base64 string | Returns `Uint8Array` with correct byte length |
| **UT-03** | `components/EmailAgent` | Initial Render State | N/A | "Analyze" button is disabled; Result panel shows placeholder |
| **UT-04** | `services/geminiService` | `getAiClient` missing key | `process.env.API_KEY = undefined` | Throws Error: "API_KEY environment variable is missing" |

### 2. Integration Test Cases

| ID | Module | Test Scenario | Pre-conditions | Expected Result |
|:---|:---|:---|:---|:---|
| **IT-01** | Email Service | Analyze valid email text | Valid API Key | Returns Markdown string; Component state updates to `success` |
| **IT-02** | Image Service | Edit Image request | Image selected, Prompt entered | Calls `models.generateContent` with inlineData; Returns Data URI |
| **IT-03** | Live Connection | WebSocket Connection | Microphone Permissions granted | Status changes: `connecting` -> `connected`; `onopen` callback fires |

### 3. End-to-End (E2E) Test Cases (Cypress/Playwright)

| ID | User Flow | Test Steps | Expected Result |
|:---|:---|:---|:---|
| **E2E-01** | Theme Switching | 1. Open App<br>2. Check background color<br>3. Click "Light Mode"<br>4. Check background color | Root class changes; Background gradient updates to Light Mode values |
| **E2E-02** | Full Image Workflow | 1. Go to Image Editor<br>2. Upload `test.png`<br>3. Type "Make it blue"<br>4. Click Generate<br>5. Click Download | Loader appears; Generated image renders; Download is triggered. |
| **E2E-03** | Navigation | 1. Click Email Agent<br>2. Click Voice Assistant | URL or View State updates; Voice Component mounts correctly |

### 4. System Integration Testing (SIT)

| ID | Scenario | Details | Pass/Fail |
|:---|:---|:---|:---|
| **SIT-01** | Network Latency | Simulate 3G network conditions during Live Voice session. | [ ] |
| **SIT-02** | Token Limits | Input 50,000 characters into Email Agent to test context window limits. | [ ] |
| **SIT-03** | Audio Hardware | Test with external bluetooth microphone vs internal microphone. | [ ] |

### 5. Scrum / User Acceptance Tests (UAT)

| ID | User Story | Acceptance Criteria | Notes |
|:---|:---|:---|:---|
| **US-01** | *As a professional, I want to categorize emails so I can prioritize.* | Result must explicitly state "Category: Urgent/Important". | Critical Feature |
| **US-02** | *As a user, I want to edit images without Photoshop skills.* | I can simply type "Remove background" and get a result. | |
| **US-03** | *As a user, I want a dark mode interface.* | App must default to Dark Mode; Toggle must persist pref in LocalStorage. | Verified |
| **US-04** | *As a user, I want to save the edited images.* | Clicking "Download" saves the file to the local device with the correct extension. | Added in v1.1.0 |

---

## 🛠 Project Structure

```bash
.
├── index.html           # Root HTML, Tailwind Config, Glass styles
├── index.tsx            # React Entry Point
├── App.tsx              # Main Layout & Routing
├── constants.ts         # System Prompts & Model IDs
├── types.ts             # TypeScript Interfaces
├── components/
│   ├── EmailAgent.tsx   # Text Analysis UI
│   ├── ImageEditor.tsx  # Generative Image UI
│   └── VoiceAssistant.tsx # Live API & Visualizer
└── services/
    ├── geminiService.ts # SDK Implementation
    └── audioUtils.ts    # PCM Encoding/Decoding
```
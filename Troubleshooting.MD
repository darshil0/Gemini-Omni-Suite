# Troubleshooting Guide - Gemini Omni-Suite

## Common Issues and Solutions

### 🔑 API Key Issues

#### Problem: "API key is not configured"
**Symptoms:**
- Application shows error message about missing API key
- No features work
- Console shows: `API_KEY environment variable is missing`

**Solutions:**
1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Get your API key from https://aistudio.google.com/app/apikey

3. Add it to `.env`:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Important**: Restart the dev server after adding the API key:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

5. Verify the key is loaded:
   ```typescript
   console.log('API Key present:', !!import.meta.env.VITE_GEMINI_API_KEY);
   ```

#### Problem: "API key invalid"
**Solutions:**
1. Double-check your API key for typos
2. Ensure there are no spaces before/after the key
3. Generate a new API key if needed
4. Check if your API key has the necessary permissions

---

### 📧 Email Agent Issues

#### Problem: Email analysis returns "Invalid response format"
**Symptoms:**
- Analysis button works but shows error
- Console shows JSON parsing errors

**Solutions:**
1. Check your email text length (should be < 10,000 characters)
2. Try simpler email text first to verify setup
3. Check the console for the actual API response
4. Verify your model has text generation capabilities

#### Problem: Analysis is slow
**Solutions:**
1. Check your internet connection
2. The model may be processing - wait 10-15 seconds
3. Check Gemini API status: https://status.cloud.google.com/
4. Reduce email text length

#### Problem: Wrong categorization
**Solutions:**
1. This is expected - AI models aren't perfect
2. Try more explicit email content
3. Update the system prompt in `constants.ts` for better results
4. Consider adding examples to the prompt

---

### 🎨 Image Editor Issues

#### Problem: "Invalid image format"
**Symptoms:**
- Upload button doesn't accept file
- Error after selecting image

**Solutions:**
1. Ensure image is JPG, PNG, or WebP format
2. Convert image if needed: https://cloudconvert.com/
3. Check file extension matches actual format
4. Try a different image to isolate the issue

#### Problem: "Image file is too large"
**Solutions:**
1. Resize image before uploading
2. Compress image: https://tinypng.com/
3. Maximum size is 10MB
4. Try lower resolution version

#### Problem: Generated image looks the same
**Symptoms:**
- Image appears unchanged after editing
- No visible differences

**Important Note:**
⚠️ **Gemini's current API doesn't actually edit images** - it analyzes and describes them. For real image editing, you need:

- **Stability AI**: SDXL for actual transformations
- **OpenAI**: DALL-E 3 for image variations
- **Adobe Firefly**: Professional editing API
- **Replicate**: Various image models

To integrate real image editing:
```typescript
// Example with Replicate
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${REPLICATE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    version: 'stability-ai/sdxl',
    input: {
      image: base64Image,
      prompt: editPrompt
    }
  })
});
```

---

### 🎙️ Voice Assistant Issues

#### Problem: "Could not access microphone"
**Symptoms:**
- Microphone button shows error
- No audio visualization
- Browser permission denied

**Solutions:**

**For Chrome/Edge:**
1. Click the 🔒 or ⓘ icon in the address bar
2. Set "Microphone" to "Allow"
3. Refresh the page

**For Firefox:**
1. Click the 🔒 icon
2. Click "Connection Secure" → "More Information"
3. Go to "Permissions" tab
4. Check "Use the Microphone"

**For Safari:**
1. Safari → Settings → Websites → Microphone
2. Set your site to "Allow"

**General:**
- Ensure you're using HTTPS (required for microphone)
- Check if another app is using the microphone
- Try in an incognito/private window
- Restart your browser

#### Problem: WebSocket connection fails
**Symptoms:**
- Voice assistant shows "connecting" forever
- Console shows WebSocket errors
- Connection drops immediately

**Solutions:**
1. Check internet connection
2. Verify Gemini Live API is available in your region
3. Check if you're using a VPN (may interfere)
4. Wait a few minutes and retry (rate limits)
5. Check API key has Live API access

**Advanced debugging:**
```typescript
// Add to VoiceAssistant.tsx
socket.onerror = (error) => {
  console.error('WebSocket error:', error);
  console.log('URL:', socket.url);
  console.log('ReadyState:', socket.readyState);
};
```

#### Problem: Audio visualization not working
**Symptoms:**
- Bars don't move
- Stuck on idle animation
- No response to speaking

**Solutions:**
1. Check microphone is actually picking up audio:
   ```typescript
   // Test in console
   navigator.mediaDevices.getUserMedia({ audio: true })
     .then(stream => {
       console.log('Mic working:', stream.active);
     });
   ```

2. Verify AudioContext is running:
   ```typescript
   console.log('Audio context state:', audioContext.state);
   ```

3. Check browser compatibility:
   - Chrome: ✅ Full support
   - Firefox: ✅ Full support  
   - Safari: ⚠️ Limited (may need user gesture)
   - Edge: ✅ Full support

4. iOS Safari specific:
   - Audio must start from user interaction
   - Use explicit button press
   - Check device is not in silent mode

#### Problem: High latency in responses
**Solutions:**
1. Check your internet speed
2. Use wired connection instead of WiFi
3. Close other bandwidth-intensive apps
4. Consider server location (some regions have higher latency)

---

### 🌐 Build & Deployment Issues

#### Problem: Build fails
**Symptoms:**
- `npm run build` shows errors
- TypeScript compilation errors

**Solutions:**
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node.js version (requires >= 18):
   ```bash
   node --version
   ```

3. Update TypeScript:
   ```bash
   npm install -D typescript@latest
   ```

4. Check for TypeScript errors:
   ```bash
   npm run lint
   ```

#### Problem: Environment variables not working in production
**Symptoms:**
- Works locally but not after deployment
- API key errors in production

**Solutions:**

**For Vercel:**
1. Go to Project Settings → Environment Variables
2. Add `VITE_GEMINI_API_KEY`
3. Redeploy

**For Netlify:**
1. Site Settings → Build & deploy → Environment
2. Add variables
3. Trigger new deploy

**For other platforms:**
- Ensure `VITE_` prefix is used
- Variables must be set at build time
- Restart/redeploy after adding variables

---

### 🎨 UI Issues

#### Problem: Glassmorphism not visible
**Symptoms:**
- UI looks flat
- No blur effects
- Missing transparency

**Solutions:**
1. Check if backdrop-filter is supported:
   ```javascript
   console.log(CSS.supports('backdrop-filter', 'blur(10px)'));
   ```

2. Update browser (older browsers don't support it)

3. For Firefox, enable in about:config:
   - Search: `layout.css.backdrop-filter.enabled`
   - Set to: `true`

4. Check Tailwind config includes backdrop utilities

#### Problem: Dark/Light mode not switching
**Solutions:**
1. Check localStorage:
   ```javascript
   console.log(localStorage.getItem('theme'));
   ```

2. Clear localStorage and try again:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

3. Verify theme toggle button is working:
   ```typescript
   console.log('Current theme:', document.documentElement.classList);
   ```

---

### 🐛 Performance Issues

#### Problem: Application is slow/laggy
**Solutions:**

1. **Check for memory leaks:**
   - Open DevTools → Performance tab
   - Record session
   - Look for increasing memory usage

2. **Audio context issues:**
   - Ensure contexts are properly closed
   - Check for orphaned WebSocket connections
   - Monitor open connections in Network tab

3. **Too many requests:**
   - Check rate limiting is working
   - Look for request loops in Network tab
   - Verify retry logic isn't excessive

4. **Large images:**
   - Resize images before processing
   - Implement image compression
   - Use lower quality for previews

5. **Browser extensions:**
   - Try in incognito mode
   - Disable extensions one by one
   - Some ad blockers interfere with WebSockets

---

### 📱 Mobile Issues

#### Problem: Touch interactions not working
**Solutions:**
1. Add touch event handlers:
   ```typescript
   onTouchStart={handleTouch}
   ```

2. Increase button/target sizes (minimum 44x44px)

3. Test with actual device, not just DevTools

#### Problem: Audio not working on iOS
**Solutions:**
1. Audio must start from direct user interaction
2. Add explicit "Start" button
3. Check device is not in silent mode
4. iOS Safari requires AudioContext resume:
   ```typescript
   await audioContext.resume();
   ```

---

### 🔍 Debugging Tips

#### Enable verbose logging:
```typescript
// Add to constants.ts
export const DEBUG = true;

// Use in services
if (DEBUG) console.log('Request:', data);
```

#### Check API responses:
```typescript
// Add to geminiService.ts
console.log('Raw API response:', response);
```

#### Monitor WebSocket:
```typescript
// Add comprehensive logging
socket.onopen = () => console.log('WS opened');
socket.onclose = (e) => console.log('WS closed:', e);
socket.onerror = (e) => console.error('WS error:', e);
socket.onmessage = (e) => console.log('WS message:', e.data);
```

#### React DevTools:
1. Install React Developer Tools extension
2. Inspect component state
3. Check for unnecessary re-renders
4. Profile performance

---

### 🆘 Still Having Issues?

1. **Check the console:**
   - Open DevTools (F12)
   - Look for red error messages
   - Check Network tab for failed requests

2. **Verify setup:**
   ```bash
   # Node version
   node --version  # Should be >= 18
   
   # Packages installed
   npm list --depth=0
   
   # Env variables
   npm run dev -- --debug
   ```

3. **Test with minimal example:**
   ```typescript
   // Create test.ts with just API call
   import { GoogleGenerativeAI } from '@google/generative-ai';
   
   const genAI = new GoogleGenerativeAI('your-key');
   const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
   
   const result = await model.generateContent('Hello');
   console.log(result.response.text());
   ```

4. **Check Gemini API status:**
   - https://status.cloud.google.com/
   - https://discuss.ai.google.dev/

5. **Community help:**
   - Open GitHub issue with:
     - Error message
     - Browser/OS version
     - Steps to reproduce
     - Console logs
   - Ask on Google AI Developer Forum

---

### 📊 Diagnostic Checklist

Before seeking help, check:

- [ ] Node.js version >= 18
- [ ] `.env` file exists with valid API key
- [ ] Dev server restarted after adding .env
- [ ] No console errors on page load
- [ ] Internet connection stable
- [ ] HTTPS (not HTTP) for production
- [ ] Browser is up to date
- [ ] Microphone permissions granted (for voice)
- [ ] No VPN/proxy interfering
- [ ] Sufficient API quota remaining
- [ ] Correct model IDs in constants.ts

---

**Last Updated**: December 2025  
**For the latest fixes**: Check the GitHub repository for updates

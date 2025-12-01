import React, { useEffect, useRef, useState } from 'react';
import { Modality, LiveServerMessage } from '@google/genai';
import { getAiClient } from '../services/geminiService';
import {
  createPcmBlob,
  decodeAudioData,
  base64ToUint8Array,
} from '../services/audioUtils';
import { MODEL_IDS } from '../constants';

const VoiceAssistant: React.FC = () => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References for Audio Management
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<Promise<any> | null>(null);

  // Audio Playback Queue Management
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Visualizer Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null); // For AI Audio
  const inputAnalyserRef = useRef<AnalyserNode | null>(null); // For User Audio

  useEffect(() => {
    return () => {
      stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = async () => {
    try {
      if (status === 'connecting' || active) return;

      setStatus('connecting');
      setErrorMessage(null);

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported in this browser');
      }

      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });

      // Ensure contexts are running (needed for some browsers policy)
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();

      inputContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;

      // Setup AI Output Analyser
      const outAnalyser = outputCtx.createAnalyser();
      outAnalyser.fftSize = 64;
      outAnalyser.smoothingTimeConstant = 0.8;
      outputAnalyserRef.current = outAnalyser;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = inputCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Setup User Input Analyser (Visual only)
      const inAnalyser = inputCtx.createAnalyser();
      inAnalyser.fftSize = 64;
      inAnalyser.smoothingTimeConstant = 0.8;
      inputAnalyserRef.current = inAnalyser;
      // Connect source to analyser (but NOT to destination to avoid feedback)
      source.connect(inAnalyser);

      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const ai = getAiClient();

      const sessionPromise = ai.live.connect({
        model: MODEL_IDS.AUDIO,
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connection Opened');
            setStatus('connected');
            setActive(true);

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const ctx = audioContextRef.current;
            // Safety check: if context is closed or missing, stop processing
            if (!ctx || ctx.state === 'closed') return;

            const base64Audio =
              message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;

            if (base64Audio) {
              try {
                nextStartTimeRef.current = Math.max(
                  nextStartTimeRef.current,
                  ctx.currentTime
                );

                const audioData = base64ToUint8Array(base64Audio);
                const audioBuffer = await decodeAudioData(
                  audioData,
                  ctx,
                  24000,
                  1
                );

                const sourceNode = ctx.createBufferSource();
                sourceNode.buffer = audioBuffer;

                if (outputAnalyserRef.current) {
                  sourceNode.connect(outputAnalyserRef.current);
                  outputAnalyserRef.current.connect(ctx.destination);
                } else {
                  sourceNode.connect(ctx.destination);
                }

                sourceNode.addEventListener('ended', () => {
                  scheduledSourcesRef.current.delete(sourceNode);
                });

                sourceNode.start(nextStartTimeRef.current);
                scheduledSourcesRef.current.add(sourceNode);

                nextStartTimeRef.current += audioBuffer.duration;
              } catch (e) {
                console.error('Error decoding/playing audio chunk', e);
              }
            }

            if (message.serverContent?.interrupted) {
              console.log('Model interrupted');
              scheduledSourcesRef.current.forEach((node) => {
                try {
                  node.stop();
                } catch (e) {}
              });
              scheduledSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log('Gemini Live Connection Closed');
            // Only call stopSession if we haven't already explicitly stopped (status check)
            if (status !== 'disconnected') {
              setStatus('disconnected');
              setActive(false);
            }
          },
          onerror: (e) => {
            console.error('Gemini Live Error', e);
            setErrorMessage('Connection error occurred.');
            stopSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction:
            'You are a helpful, conversational AI assistant. Keep responses concise and engaging.',
        },
      });

      sessionRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to access microphone or connect.');
      setStatus('error');
      stopSession();
    }
  };

  const stopSession = () => {
    setActive(false);
    setStatus('disconnected');

    if (sessionRef.current) {
      sessionRef.current
        .then((session) => session.close())
        .catch(() => {});
      sessionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (e) {}
      sourceRef.current = null;
    }

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
      } catch (e) {}
      processorRef.current = null;
    }

    if (inputContextRef.current) {
      try {
        inputContextRef.current.close();
      } catch (e) {}
      inputContextRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    nextStartTimeRef.current = 0;
    scheduledSourcesRef.current.clear();
  };

  const toggleSession = () => {
    if (status === 'connecting') return;

    if (active) {
      stopSession();
    } else {
      startSession();
    }
  };

  // Canvas Visualizer Loop
  useEffect(() => {
    let animationId: number;

    const draw = () => {
      const canvas = canvasRef.current;
      const outAnalyser = outputAnalyserRef.current;
      const inAnalyser = inputAnalyserRef.current;
      const time = performance.now() / 1000;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (active && outAnalyser && inAnalyser) {
            const bufferLength = outAnalyser.frequencyBinCount;

            const outData = new Uint8Array(bufferLength);
            outAnalyser.getByteFrequencyData(outData);

            const inData = new Uint8Array(bufferLength);
            inAnalyser.getByteFrequencyData(inData);

            // Center the drawing
            const barWidth = (canvas.width / bufferLength) * 0.8;
            let x =
              (canvas.width -
                (bufferLength * barWidth + (bufferLength - 1) * 2)) /
              2;

            for (let i = 0; i < bufferLength; i++) {
              // Combine input and output data (Max) for responsiveness to both
              const val = Math.max(outData[i], inData[i]);
              const barHeight = (val / 255) * canvas.height * 0.8;

              // Modern gradient for bars
              const gradient = ctx.createLinearGradient(
                0,
                canvas.height,
                0,
                canvas.height - barHeight
              );
              gradient.addColorStop(0, '#3b82f6');
              gradient.addColorStop(1, '#8b5cf6');

              // Draw rounded bars (pill shape)
              ctx.fillStyle = gradient;

              const y = (canvas.height - barHeight) / 2;
              const width = barWidth;
              const radius = width / 2;
              const height = Math.max(barHeight, width); // Ensure it's at least a circle

              ctx.beginPath();
              ctx.moveTo(x + radius, y);
              ctx.lineTo(x + width - radius, y);
              ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
              ctx.lineTo(x + width, y + height - radius);
              ctx.quadraticCurveTo(
                x + width,
                y + height,
                x + width - radius,
                y + height
              );
              ctx.lineTo(x + radius, y + height);
              ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
              ctx.lineTo(x, y + radius);
              ctx.quadraticCurveTo(x, y, x + radius, y);
              ctx.closePath();
              ctx.fill();

              x += barWidth + 4; // spacing
            }
          } else {
            // Idle Animation: Pulsing Sine Wave
            const isDark = document.documentElement.classList.contains('dark');
            ctx.strokeStyle = isDark
              ? 'rgba(96, 165, 250, 0.4)'
              : 'rgba(37, 99, 235, 0.3)';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();

            // Draw a compound sine wave
            for (let i = 0; i < canvas.width; i++) {
              // Taper at the ends (0 to 1 to 0)
              const normalizedX = i / canvas.width;
              const taper = Math.sin(normalizedX * Math.PI);

              // Combine two sine waves for organic movement
              const y =
                canvas.height / 2 +
                (Math.sin(i * 0.02 + time * 3) * 5 +
                  Math.sin(i * 0.05 - time * 1.5) * 3) *
                  taper;

              if (i === 0) ctx.moveTo(i, y);
              else ctx.lineTo(i, y);
            }
            ctx.stroke();

            // Add a subtle glow
            ctx.shadowColor = isDark ? '#60a5fa' : '#3b82f6';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [active]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] transition-all duration-1000 ${
          active ? 'scale-110 opacity-60' : 'scale-90 opacity-20'
        }`}
      ></div>
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] transition-all duration-1000 delay-100 ${
          active ? 'scale-125 opacity-70 translate-x-10' : 'scale-50 opacity-10'
        }`}
      ></div>

      <div className="z-10 text-center flex flex-col items-center gap-10 w-full max-w-2xl">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-tight">
            Gemini Live Voice
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-light text-lg">
            Experience real-time, uninterrupted conversation.
          </p>
        </div>

        {/* Visualizer Container */}
        <div className="h-40 w-full flex items-center justify-center relative">
          <canvas
            ref={canvasRef}
            width={600}
            height={160}
            className="w-full h-full object-contain"
          ></canvas>
        </div>

        {/* Main Interaction Area */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={toggleSession}
            disabled={status === 'connecting'}
            className={`group relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
              active
                ? 'bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)] scale-110'
                : status === 'connecting'
                ? 'bg-gray-100 dark:bg-gray-800 scale-100 cursor-not-allowed'
                : 'bg-white shadow-[0_0_30px_rgba(0,0,0,0.1)] hover:scale-105 hover:shadow-[0_0_40px_rgba(0,0,0,0.15)] dark:shadow-[0_0_30px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]'
            }`}
          >
            {active && (
              <div className="absolute inset-0 rounded-full border border-red-400 animate-[ping_2s_ease-out_infinite] opacity-50"></div>
            )}

            {active ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-md"
              >
                <rect x="6" y="4" width="4" height="16" rx="2" />
                <rect x="14" y="4" width="4" height="16" rx="2" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke={status === 'connecting' ? 'gray' : 'black'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            )}
          </button>

          <div
            className={`px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 border ${
              status === 'connected'
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                : status === 'connecting'
                ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                : status === 'error'
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                : 'bg-gray-200 dark:bg-white/5 text-gray-500 border-gray-300 dark:border-white/5'
            }`}
          >
            {status === 'connected' ? (
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Connection Active
              </span>
            ) : status === 'connecting' ? (
              <span className="animate-pulse">Establishing Uplink...</span>
            ) : status === 'error' ? (
              errorMessage || 'Connection Failed'
            ) : (
              'Ready to Connect'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
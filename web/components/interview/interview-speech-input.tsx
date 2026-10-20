"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, AlertCircle, Sparkles } from "lucide-react";

// Web Speech API interface declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: any) => any) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
}

interface InterviewSpeechInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InterviewSpeechInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "State your technical explanation or reasoning...",
}: InterviewSpeechInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // Check Web Speech API availability
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition() as SpeechRecognitionInstance;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + " ";
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const combined = (finalTranscript + interimTranscript).trim();
        if (combined) {
          onChange(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechError("Microphone permission denied.");
        } else if (event.error === "network") {
          setSpeechError("Network error during speech recognition.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Speech recognition init failure:", err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort errors
        }
      }
    };
  }, [onChange]);

  const toggleListening = () => {
    if (!recognitionRef.current || !isSupported) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        setIsListening(false);
      }
    } else {
      try {
        setSpeechError(null);
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Error starting speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        if (isListening && recognitionRef.current) {
          recognitionRef.current.stop();
        }
        onSubmit();
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Listening / Permission Notice */}
      {speechError && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/30 border border-amber-800/50 rounded-lg px-3 py-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{speechError} You can type your defense response below.</span>
        </div>
      )}

      {isListening && (
        <div className="flex items-center justify-between text-xs text-rose-300 bg-rose-950/30 border border-rose-800/50 rounded-lg px-3 py-1.5 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span className="font-medium">Listening to oral defense answer... Speak clearly into your mic.</span>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className="text-[11px] underline text-rose-200 hover:text-white"
          >
            Stop
          </button>
        </div>
      )}

      {/* Input Textarea Container */}
      <div className="relative rounded-xl border border-slate-700/80 bg-slate-900/70 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-inner">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-transparent p-3.5 pr-24 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none custom-scrollbar"
        />

        {/* Action Controls (Mic + Submit) */}
        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          {/* Speech-to-Text Button */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={disabled || !isSupported}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              !isSupported
                ? "border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                : isListening
                ? "border-rose-500 bg-rose-500/20 text-rose-300 animate-pulse ring-2 ring-rose-500/40"
                : "border-slate-700/80 bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-600"
            }`}
            aria-label={
              !isSupported
                ? "Speech-to-text not supported in browser"
                : isListening
                ? "Stop speech recognition"
                : "Start voice answer with speech-to-text"
            }
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-rose-400" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => {
              if (isListening && recognitionRef.current) {
                recognitionRef.current.stop();
              }
              onSubmit();
            }}
            disabled={disabled || !value.trim()}
            className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            aria-label="Submit defense answer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input Hint */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Enter</kbd> to submit, <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Shift+Enter</kbd> for newline
        </span>
        <span>
          {isSupported ? "Voice & Text Supported" : "Keyboard Input Only"}
        </span>
      </div>
    </div>
  );
}

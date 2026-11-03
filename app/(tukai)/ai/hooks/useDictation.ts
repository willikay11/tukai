'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { toast } from '@/app/shared/hooks/useToast';

const BLOCKED = /not-allowed|service-not-allowed|audio-capture/;

/**
 * Dictation into the composer, through the browser's own speech recognition
 * (en-KE, live results). What is heard is added after what was already
 * typed, up to `max` characters.
 *
 * Where the browser blocks the microphone or has no speech recognition, it
 * says so instead of typing a sample phrase as the prototype did (the
 * handoff's open question 10).
 */
export const useDictation = ({
  value,
  onChange,
  onEnd,
  max = 2000,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Focus goes back to the text box. */
  onEnd?: () => void;
  max?: number;
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const latest = useRef({ onChange, onEnd });
  latest.current = { onChange, onEnd };

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // Already stopped
      }
    }
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    const SR =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SR) {
      toast({
        description: 'Dictation is not available in this browser. Type your message instead.',
      });
      return;
    }

    const base = value;
    const sep = base && !/\s$/.test(base) ? ' ' : '';
    let finalText = '';
    let heard = false;
    let recognition: any;
    try {
      recognition = new SR();
    } catch {
      toast({
        description: 'Dictation is not available in this browser. Type your message instead.',
      });
      return;
    }
    recognition.lang = 'en-KE';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      if (recognitionRef.current !== recognition) return;
      heard = true;
      let interim = '';
      for (let k = event.resultIndex; k < event.results.length; k++) {
        const text = event.results[k][0].transcript;
        if (event.results[k].isFinal) finalText += text;
        else interim += text;
      }
      latest.current.onChange((base + sep + (finalText + interim).trim()).slice(0, max));
    };
    recognition.onerror = (event: any) => {
      if (recognitionRef.current !== recognition) return;
      if (!heard && BLOCKED.test(String(event.error))) {
        toast({
          description:
            "TukAI can't hear you. Allow the microphone in your browser, then try again.",
        });
      }
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      setIsListening(false);
      latest.current.onEnd?.();
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
    }
  }, [max, value]);

  const toggle = useCallback(() => (recognitionRef.current ? stop() : start()), [start, stop]);

  // Leaving the page stops listening
  useEffect(() => stop, [stop]);

  return { isListening, toggle, stop };
};

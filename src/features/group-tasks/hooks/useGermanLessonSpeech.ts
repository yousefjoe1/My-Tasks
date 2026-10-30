"use client";

import { useEffect, useRef } from "react";

function pickGermanVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "de-DE") ??
    voices.find((v) => v.lang.startsWith("de"))
  );
}

export function useGermanLessonSpeech(
  speakText: string | null,
  onSpeaking: (message: string) => void
) {
  const onSpeakingRef = useRef(onSpeaking);
  onSpeakingRef.current = onSpeaking;

  useEffect(() => {
    if (!speakText?.trim()) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    let cancelled = false;
    let voicesListener: (() => void) | null = null;

    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(speakText.trim());
      utterance.lang = "de-DE";
      utterance.rate = 0.9;

      const applyVoice = () => {
        const voice = pickGermanVoice();
        if (voice) utterance.voice = voice;
      };

      applyVoice();
      if (window.speechSynthesis.getVoices().length === 0) {
        voicesListener = () => {
          applyVoice();
          window.speechSynthesis.removeEventListener("voiceschanged", voicesListener!);
        };
        window.speechSynthesis.addEventListener("voiceschanged", voicesListener);
      }

      utterance.onstart = () => {
        if (!cancelled) {
          onSpeakingRef.current("جاري تشغيل نطق الدرس الألماني…");
        }
      };

      window.speechSynthesis.speak(utterance);
    }, 800);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (voicesListener) {
        window.speechSynthesis.removeEventListener("voiceschanged", voicesListener);
      }
      window.speechSynthesis.cancel();
    };
  }, [speakText]);
}

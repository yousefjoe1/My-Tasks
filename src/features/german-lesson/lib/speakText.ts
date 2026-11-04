function pickGermanVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "de-DE") ??
    voices.find((v) => v.lang.startsWith("de"))
  );
}

/** Speak German text via the Web Speech API (cancels any ongoing speech first). */
export function speakText(text: string, rate = 0.85): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const trimmed = text.trim();
  if (!trimmed) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.lang = "de-DE";
  utterance.rate = rate;

  const applyVoice = () => {
    const voice = pickGermanVoice();
    if (voice) utterance.voice = voice;
  };

  applyVoice();
  if (window.speechSynthesis.getVoices().length === 0) {
    const onVoices = () => {
      applyVoice();
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      window.speechSynthesis.speak(utterance);
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    return;
  }

  window.speechSynthesis.speak(utterance);
}

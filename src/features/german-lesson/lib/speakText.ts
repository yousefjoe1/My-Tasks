
/** Speak German text via the Web Speech API (cancels any ongoing speech first). */

function pickGermanVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  // console.log("🚀 ~ pickGermanVoice ~ voices:", voices)

  // Prefer German voices, prioritizing exact German locale
  return (
    voices.find(
      (v) => v.lang.toLowerCase() === "de-de" && !v.localService === false
    ) ??
    voices.find((v) => v.lang.toLowerCase() === "de-de") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("de-")) ??
    voices.find((v) => v.lang.toLowerCase() === "de")
  );
}

/**
 * Speak German text using the Web Speech API.
 */
export function speakText(text: string, rate = 0.85): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const trimmed = text.trim();
  if (!trimmed) return;

  const synth = window.speechSynthesis;

  synth.cancel();

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(trimmed);

    utterance.lang = "de-DE";
    utterance.rate = rate;
    utterance.pitch = 1;

    const germanVoice = pickGermanVoice();

    if (germanVoice) {
      utterance.voice = germanVoice;
      utterance.lang = germanVoice.lang;
    }

    synth.speak(utterance);
  };

  const voices = synth.getVoices();

  if (voices.length > 0) {
    speak();
    return;
  }

  const handleVoicesChanged = () => {
    synth.removeEventListener("voiceschanged", handleVoicesChanged);
    speak();
  };

  synth.addEventListener("voiceschanged", handleVoicesChanged);
}

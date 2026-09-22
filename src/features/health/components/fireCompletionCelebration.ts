"use client";

export async function fireCompletionCelebration() {
  const confetti = (await import("canvas-confetti")).default;

  const burst = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ["#22c55e", "#3b82f6", "#eab308", "#f97316"],
    });
  };

  burst();
  window.setTimeout(burst, 180);
}

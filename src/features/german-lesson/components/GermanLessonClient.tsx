"use client";

import {
  lessonToDisplay,
  pickRandomLesson,
  resolveInitialLesson,
  type LessonDisplay,
} from "@/features/german-lesson/lib/lessonUtils";
import { speakText } from "@/features/german-lesson/lib/speakText";
import { Loader2, RefreshCw, Volume2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function GermanLessonClient() {
  const searchParams = useSearchParams();
  const speakParam = searchParams.get("speak");
  const initialized = useRef(false);
  const [lesson, setLesson] = useState<LessonDisplay | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLesson(resolveInitialLesson(speakParam));
    setSpeechSupported(
      typeof window !== "undefined" && "speechSynthesis" in window
    );
  }, [speakParam]);

  useEffect(() => {
    if (!lesson || !speechSupported) return;
    const timer = window.setTimeout(() => speakText(lesson.german), 500);
    return () => window.clearTimeout(timer);
  }, [lesson, speechSupported]);

  const handleReplay = useCallback(() => {
    if (!lesson) return;
    speakText(lesson.german);
  }, [lesson]);

  const handleNext = useCallback(() => {
    const next = lessonToDisplay(pickRandomLesson(lesson?.german));
    setLesson(next);
  }, [lesson?.german]);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
        <Loader2 className="size-8 animate-spin" aria-hidden />
        <p className="text-sm font-medium">جاري تحميل الدرس…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-brand">Deutsch</p>
        <h1 className="mt-2 text-2xl font-black text-primary lg:text-3xl">درس ألماني يومي</h1>
        <p className="mt-2 text-sm text-muted">استمع، كرّر، ثم جرّب جملة جديدة.</p>
      </header>

      {!speechSupported && (
        <p className="rounded-xl border border-brand-warning/30 bg-brand-warning/10 px-4 py-2 text-center text-sm text-brand-warning">
          المتصفح لا يدعم النطق الصوتي.
        </p>
      )}

      <article className="rounded-3xl border border-secondary bg-primary p-8 shadow-lg transition-shadow hover:shadow-xl">
        <p
          className="text-center text-2xl font-bold leading-snug text-primary md:text-3xl"
          lang="de"
          dir="ltr"
        >
          {lesson.german}
        </p>
        {lesson.arabic ? (
          <p className="mt-6 border-t border-secondary pt-6 text-center text-lg text-muted" dir="rtl">
            {lesson.arabic}
          </p>
        ) : null}
      </article>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleReplay}
          disabled={!speechSupported}
          className="btn btn-secondary h-auto flex-1"
        >
          <Volume2 className="size-5" aria-hidden />
          إعادة السماع
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!speechSupported}
          className="btn btn-primary h-auto flex-1"
        >
          <RefreshCw className="size-5" aria-hidden />
          جملة أخرى
        </button>
      </div>
    </div>
  );
}

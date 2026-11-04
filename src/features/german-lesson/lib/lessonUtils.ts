import {
  slowGermanLessons,
  type GermanLesson,
} from "@/features/german-lesson/constants/slowGermanLessons";
import {
  arabicTextAfterPipe,
  germanTextBeforePipe,
} from "@/lib/germanLessonText";

export interface LessonDisplay {
  german: string;
  arabic: string;
}

export function lessonToDisplay(lesson: GermanLesson): LessonDisplay {
  const source = lesson.title.includes("|") ? lesson.title : lesson.description;
  return {
    german: germanTextBeforePipe(source),
    arabic: arabicTextAfterPipe(source),
  };
}

export function findLessonByGerman(german: string): GermanLesson | undefined {
  const needle = german.trim().toLowerCase();
  return slowGermanLessons.find(
    (lesson) => germanTextBeforePipe(lesson.title).toLowerCase() === needle
  );
}

export function resolveInitialLesson(speakParam: string | null): LessonDisplay {
  if (speakParam?.trim()) {
    const matched = findLessonByGerman(speakParam);
    if (matched) return lessonToDisplay(matched);
    return { german: speakParam.trim(), arabic: "" };
  }
  return lessonToDisplay(pickRandomLesson());
}

export function pickRandomLesson(excludeGerman?: string): GermanLesson {
  const pool =
    excludeGerman && slowGermanLessons.length > 1
      ? slowGermanLessons.filter(
          (l) => germanTextBeforePipe(l.title) !== excludeGerman
        )
      : slowGermanLessons;
  return pool[Math.floor(Math.random() * pool.length)] ?? slowGermanLessons[0];
}

/** German portion before the bilingual `|` separator. */
export function germanTextBeforePipe(text: string): string {
  const pipeIndex = text.indexOf("|");
  const segment = pipeIndex === -1 ? text : text.slice(0, pipeIndex);
  return segment.trim();
}

/** Arabic portion after the bilingual `|` separator. */
export function arabicTextAfterPipe(text: string): string {
  const pipeIndex = text.indexOf("|");
  if (pipeIndex === -1) return "";
  return text.slice(pipeIndex + 1).trim();
}

export function pickGermanSpeakText(lesson: {
  title: string;
  description: string;
}): string {
  const fromTitle = germanTextBeforePipe(lesson.title);
  if (fromTitle.length > 0) return fromTitle;
  return germanTextBeforePipe(lesson.description);
}

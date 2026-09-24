const REST_DAY_MESSAGES = [
  "Today's a rest day. Your garden rests too — roots grow underground even when nothing shows above.",
  "No goal today, on purpose. Take the day off; your plant will be right here tomorrow.",
  'Rest day. Missing nothing, earning nothing to worry about — just breathe and come back tomorrow.',
];

/** Deterministic per-date pick, so a given day's message doesn't change on re-render. */
function hashDateToIndex(date: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

export function getRestDayMessage(date: string): string {
  return REST_DAY_MESSAGES[hashDateToIndex(date, REST_DAY_MESSAGES.length)];
}

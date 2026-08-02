export type PlaybackSpeed = 'slow' | 'normal';

const RATE_BY_SPEED: Record<PlaybackSpeed, number> = {
  slow: 0.6,
  normal: 0.95,
};

/**
 * Recorded audio is the intended long-term default — `audioUrl`/`audioUrlSlow` on a
 * Phrase are meant to be filled in with real pronunciation recordings. Until then,
 * browser speech synthesis is a temporary fallback so the feature works today without
 * blocking on recordings. Swapping in real audio later is a content-only change.
 */
export function playPhrase(
  text: string,
  speed: PlaybackSpeed,
  urls: { audioUrl?: string; audioUrlSlow?: string } = {},
): void {
  const recordedUrl = speed === 'slow' ? urls.audioUrlSlow : urls.audioUrl;
  if (recordedUrl) {
    void new Audio(recordedUrl).play().catch(() => {});
    return;
  }

  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = RATE_BY_SPEED[speed];
  window.speechSynthesis.speak(utterance);
}

export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis;
}

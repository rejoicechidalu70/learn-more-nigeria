/** Read-aloud voice notes using the device's own voice — works on phones without any download. */

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}

/** Speaks text aloud. `lang` selects the voice (e.g. "yo-NG" for Yoruba). Returns false when the device has no voice support. */
export function speak(text: string, onEnd?: () => void, lang = "en-NG"): boolean {
  if (!speechSupported()) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  u.lang = lang;
  const base = lang.split("-")[0];
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(base)) ??
    window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("en"));
  if (voice) u.voice = voice;
  const done = () => onEnd?.();
  u.onend = done;
  u.onerror = done;
  window.speechSynthesis.speak(u);
  return true;
}

/**
 * Minimal types for the Web Speech API.
 *
 * `lib.dom.d.ts` doesn't ship these (the spec is still a draft and
 * Safari uses the webkit-prefixed name), so we declare the shape we use
 * here and import it wherever a page touches recognition.
 *
 * If you need to extend (e.g. `maxAlternatives`, custom result detail),
 * add the field here — never reach for `as any` in callers again.
 */

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence?: number;
}

export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  0: SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

/** Returns the vendor-prefixed constructor if available, else null. */
export function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Read-aloud and voice input for the Resident survey.
 *
 * Both toggles used to be inert: they flipped a boolean in `residentState` that
 * nothing read, under intro copy that promised "turn on audio to hear each
 * question and answer by voice". This is what makes that sentence true.
 *
 * Browser-native on purpose. The tenant's existing TTS (`/api/tts`) is an
 * ElevenLabs allowlist keyed by slide id — the server looks the text up so a
 * client can never bill arbitrary synthesis — which is exactly the wrong shape
 * for a survey whose questions the author edits. `speechSynthesis` speaks
 * whatever it is given, needs no key, and works with the network off. Speech
 * recognition has no server-side option here at all.
 *
 * Support is checked rather than assumed: `SpeechRecognition` is Chromium and
 * Safari only. The caller hides the toggle when `supported` is false, because a
 * switch that cannot do anything is the problem this was fixing.
 */

const getRecognition = () =>
  typeof window === 'undefined'
    ? null
    : window.SpeechRecognition || window.webkitSpeechRecognition || null;

export const speechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

export const voiceInputSupported = () => getRecognition() !== null;

/**
 * Speak text on demand.
 *
 * `cancel` before every utterance: the queue is global to the tab, so a resident
 * who answers quickly would otherwise hear question 3 finish reading over the
 * top of question 4.
 */
export function useReadAloud(enabled) {
  const [speakingId, setSpeakingId] = useState(null);

  /**
   * Silence the synthesiser. Touches ONLY the external system — the highlight
   * is cleared by the utterance's own `end` event, which cancel() fires.
   *
   * That split is what lets the effects below stay pure synchronisation rather
   * than setState-in-an-effect-body.
   */
  const cancel = useCallback(() => {
    if (speechSupported()) window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback((id, text) => {
    if (!speechSupported() || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // A shade under natural pace. This is a government form being read to
    // someone who may be filling it in for the first time.
    utterance.rate = 0.95;
    const clear = () => setSpeakingId((current) => (current === id ? null : current));
    utterance.onend = clear;
    utterance.onerror = clear;
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  }, []);

  // Turning the switch off stops the sentence in progress, and leaving the
  // survey must not leave a voice reading into an empty room.
  useEffect(() => {
    if (!enabled) cancel();
  }, [enabled, cancel]);

  useEffect(() => cancel, [cancel]);

  return { speak, cancel, speakingId, supported: speechSupported() };
}

/**
 * Listen for one spoken answer.
 *
 * Single-shot rather than continuous: each utterance answers one question, and
 * a recogniser left running across a branch would attach the next sentence to
 * the wrong step.
 */
export function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // The callback closes over the current question, which changes every turn, and
  // `start` must not be rebuilt each time or the button would lose its handler
  // mid-utterance. Assigned in an effect rather than during render.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Recognition = getRecognition();
    if (!Recognition) return;

    // Reading the question aloud and listening at the same time makes the
    // recogniser transcribe the app's own voice.
    if (speechSupported()) window.speechSynthesis.cancel();

    recognitionRef.current?.abort();
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) onResultRef.current?.(transcript);
    };
    recognition.onerror = (event) => {
      setError(
        event.error === 'not-allowed'
          ? 'Microphone access was blocked. You can still type your answer.'
          : 'I did not catch that. Try again, or type your answer.',
      );
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    setError(null);
    setListening(true);
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      // start() throws if the recogniser is already running; the onend handler
      // above settles the state either way.
      setListening(false);
    }
  }, []);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { start, stop, listening, error, supported: voiceInputSupported() };
}

/**
 * Match what the resident said against the options they were offered.
 *
 * This is the ONLY place in the survey where an interpretation actually happens,
 * and therefore the only place a confidence score means anything. A tapped
 * option is not interpreted — it is chosen — and showing "AI Confidence: 93%"
 * over it claimed a judgement nobody made.
 *
 * Returns `null` when nothing is close enough, so the caller can say it did not
 * understand instead of recording a guess.
 */
export function matchSpokenAnswer(transcript, options) {
  const said = normalise(transcript);
  if (said.length === 0 || !options?.length) return null;

  // Ties go to the MORE SPECIFIC option. "I was very dissatisfied" matches
  // "Dissatisfied" and "Very dissatisfied" equally well by word overlap, and
  // taking the first of those recorded the opposite of a strong opinion as a
  // mild one.
  let best = null;
  for (const option of options) {
    const words = normalise(option);
    const score = similarity(said, words);
    const better = !best || score > best.score || (score === best.score && words.length > best.length);
    if (better) best = { option, score, length: words.length };
  }
  if (!best || best.score < 0.4) return null;

  return {
    option: best.option,
    // Reported as a percentage, and deliberately not rounded up to the 90s the
    // rest of the tenant's cards carry — a spoken answer matched on two words
    // out of five should look less certain than one matched outright.
    confidence: Math.round(Math.min(0.99, best.score) * 100),
  };
}

const FILLER = new Set(['the', 'a', 'an', 'i', 'it', 'was', 'is', 'am', 'to', 'of', 'that', 'this', 'my', 'me', 'and']);

const normalise = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !FILLER.has(w));

/**
 * Overlap of the option's words with the spoken words.
 *
 * Scored against the OPTION's length, not the transcript's, so "I was very
 * satisfied with all of it" still matches "Very satisfied" outright.
 */
function similarity(saidWords, optionWords) {
  if (!optionWords.length) return 0;
  // Above 1 on purpose: an exact phrase must beat a shorter option that the
  // same words happen to cover completely. The confidence is capped back to 99
  // by the caller, so this only ever affects which option wins.
  if (saidWords.join(' ') === optionWords.join(' ')) return 1.25;
  const said = new Set(saidWords);
  const hits = optionWords.filter((w) => said.has(w)).length;
  return hits / optionWords.length;
}

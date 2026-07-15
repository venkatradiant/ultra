import { useCallback, useEffect, useRef } from 'react';

// ─── Web Speech fallback voice selection ─────────────────────────────
// Preferred voices, most natural first. Online/neural voices sound the most
// human; we fall back to the best local English voice if none are present.
const VOICE_PREFS = [
  'Google US English',
  'Microsoft Aria Online (Natural)',
  'Microsoft Jenny Online (Natural)',
  'Microsoft Guy Online (Natural)',
  'Microsoft Aria',
  'Samantha',
  'Ava (Premium)',
  'Ava (Enhanced)',
  'Ava',
  'Zoe (Premium)',
  'Allison',
  'Serena',
];

const RATE = 0.97;

function pickVoice(voices) {
  if (!voices || !voices.length) return null;
  const en = voices.filter((v) => /^en(-|_|$)/i.test(v.lang));
  const pool = en.length ? en : voices;
  for (const name of VOICE_PREFS) {
    const exact = pool.find((v) => v.name === name);
    if (exact) return exact;
    const partial = pool.find((v) => v.name.includes(name));
    if (partial) return partial;
  }
  const onlineUs = pool.find((v) => v.localService === false && /en[-_]US/i.test(v.lang));
  if (onlineUs) return onlineUs;
  const us = pool.find((v) => /en[-_]US/i.test(v.lang));
  return us || pool[0];
}

function splitSentences(text) {
  const parts = String(text).match(/[^.!?…]+[.!?…]+["')\]]?(\s|$)|[^.!?…]+$/g);
  return (parts || [String(text)]).map((s) => s.trim()).filter(Boolean);
}

const countWords = (t) => String(t).trim().split(/\s+/).filter(Boolean).length || 1;

// Bump when the voice or scripts change — the proxy responses are CDN/browser
// cached by URL (which doesn't include the voice), so a version token forces the
// audio to regenerate with the current voice instead of serving stale clips.
const NARRATION_VERSION = 'v2-D3VC';
const ttsUrl = (slideId) => `/api/tts?slide=${encodeURIComponent(slideId)}&v=${NARRATION_VERSION}`;
const AUDIO_LOAD_TIMEOUT = 6000; // ms to wait for the proxy MP3 before falling back

// Narration controller. Prefers the ElevenLabs voiceover served by our /api/tts
// proxy (studio-quality, exact duration); on any failure — key unset, function
// error, offline, local `vite` without the dev shim — it falls back to the
// browser-native Web Speech API, then the caller's own timer. A generation guard
// makes stale callbacks from a superseded/cancelled run no-ops.
export default function useNarration() {
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const supported = typeof window !== 'undefined' && (typeof Audio !== 'undefined' || speechSupported);

  const genRef = useRef(0);
  const voiceRef = useRef(null);
  const intervalRef = useRef(null);
  const watchdogRef = useRef(null);
  const loadTimerRef = useRef(null);
  const audioRef = useRef(null);
  const engineRef = useRef(null); // 'audio' | 'speech' | null

  useEffect(() => {
    if (!speechSupported) return undefined;
    const synth = window.speechSynthesis;
    const pick = () => { voiceRef.current = pickVoice(synth.getVoices()); };
    pick();
    synth.addEventListener?.('voiceschanged', pick);
    return () => synth.removeEventListener?.('voiceschanged', pick);
  }, [speechSupported]);

  const clearTimers = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
    if (loadTimerRef.current) { clearTimeout(loadTimerRef.current); loadTimerRef.current = null; }
  };

  const teardownAudio = () => {
    const a = audioRef.current;
    if (a) {
      a.onended = null; a.onerror = null; a.ontimeupdate = null; a.oncanplay = null; a.onplaying = null;
      try { a.pause(); } catch { /* ignore */ }
      a.removeAttribute('src');
      audioRef.current = null;
    }
  };

  const cancel = useCallback(() => {
    genRef.current += 1;
    clearTimers();
    teardownAudio();
    engineRef.current = null;
    if (speechSupported) window.speechSynthesis.cancel();
  }, [speechSupported]);

  // Web Speech fallback engine (chunked utterances + word-count progress + watchdog).
  const speakWithSpeech = useCallback((text, gen, onProgress, onEnd) => {
    if (!speechSupported || !text) { onProgress?.(1); onEnd?.(); return; }
    engineRef.current = 'speech';
    const synth = window.speechSynthesis;
    if (synth.paused) synth.resume();
    if (!voiceRef.current) voiceRef.current = pickVoice(synth.getVoices());

    const sentences = splitSentences(text);
    const estMs = Math.max(1500, (countWords(text) / (2.6 * RATE)) * 1000);
    onProgress?.(0);

    let done = false;
    const finish = () => {
      if (done || gen !== genRef.current) return;
      done = true;
      clearTimers();
      onProgress?.(1);
      onEnd?.();
    };

    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      if (gen !== genRef.current) return;
      if (window.speechSynthesis.paused) return;
      elapsed += 100;
      onProgress?.(Math.min(0.985, elapsed / estMs));
    }, 100);
    watchdogRef.current = setTimeout(finish, estMs + 4000);

    let qi = 0;
    const speakNext = () => {
      if (done || gen !== genRef.current) return;
      if (qi >= sentences.length) { finish(); return; }
      const u = new SpeechSynthesisUtterance(sentences[qi]);
      if (voiceRef.current) { u.voice = voiceRef.current; u.lang = voiceRef.current.lang; }
      u.rate = RATE;
      u.pitch = 1;
      u.onend = () => { qi += 1; speakNext(); };
      u.onerror = () => { qi += 1; speakNext(); };
      synth.speak(u);
    };
    speakNext();
  }, [speechSupported]);

  // Primary entry. Tries the ElevenLabs proxy MP3 for `slideId`; on failure falls
  // back to Web Speech reading `text`. `nextSlideId` is prefetched for a gapless
  // advance.
  const speak = useCallback((slideId, text, { onProgress, onEnd, nextSlideId } = {}) => {
    cancel();
    const gen = genRef.current;

    if (typeof Audio === 'undefined') { speakWithSpeech(text, gen, onProgress, onEnd); return; }

    let settled = false;
    const fallback = () => {
      if (settled || gen !== genRef.current) return;
      settled = true;
      clearTimers();
      teardownAudio();
      speakWithSpeech(text, gen, onProgress, onEnd);
    };
    const finish = () => {
      if (settled || gen !== genRef.current) return;
      settled = true;
      clearTimers();
      onProgress?.(1);
      onEnd?.();
    };

    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;
    engineRef.current = 'audio';
    onProgress?.(0);

    audio.oncanplay = () => { if (loadTimerRef.current) { clearTimeout(loadTimerRef.current); loadTimerRef.current = null; } };
    audio.onplaying = () => { if (loadTimerRef.current) { clearTimeout(loadTimerRef.current); loadTimerRef.current = null; } };
    audio.ontimeupdate = () => {
      if (gen !== genRef.current || !audio.duration || !isFinite(audio.duration)) return;
      onProgress?.(Math.min(0.999, audio.currentTime / audio.duration));
    };
    audio.onended = finish;
    audio.onerror = fallback;

    // If the proxy MP3 hasn't started within the timeout, fall back.
    loadTimerRef.current = setTimeout(() => { if (!audio.duration) fallback(); }, AUDIO_LOAD_TIMEOUT);

    audio.src = ttsUrl(slideId);
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(fallback);

    // Warm the CDN/browser cache for the next slide.
    if (nextSlideId) { try { const n = new Audio(); n.preload = 'auto'; n.src = ttsUrl(nextSlideId); } catch { /* ignore */ } }
  }, [cancel, speakWithSpeech]);

  const pause = useCallback(() => {
    if (engineRef.current === 'audio') { try { audioRef.current?.pause(); } catch { /* ignore */ } }
    else if (speechSupported) window.speechSynthesis.pause();
  }, [speechSupported]);

  const resume = useCallback(() => {
    if (engineRef.current === 'audio') { try { audioRef.current?.play(); } catch { /* ignore */ } }
    else if (speechSupported) window.speechSynthesis.resume();
  }, [speechSupported]);

  const isPaused = useCallback(() => {
    if (engineRef.current === 'audio') return !!audioRef.current?.paused;
    return speechSupported && window.speechSynthesis.paused;
  }, [speechSupported]);

  return { supported, speak, pause, resume, cancel, isPaused };
}

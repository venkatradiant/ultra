import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './presentation.css';
import pres from '../../../../data/ussfcu/ceo/presentation.json';

import DeckLineageOverlay from './DeckLineageOverlay';
import PresentationChatSheet from './PresentationChatSheet';
import ClosingModal from './ClosingModal';
import { resolve, findById, suggestionsFor, greeting, slideIdForIndex } from './presentationChat';
import useNarration from './useNarration';
import narrationData from '../../../../data/ussfcu/ceo/presentationNarration.json';
import SlideSituational from './slides/SlideSituational';
import SlideEvidence from './slides/SlideEvidence';
import SlideTrajectory from './slides/SlideTrajectory';
import SlideAssurance from './slides/SlideAssurance';
import SlideMembers from './slides/SlideMembers';
import SlideResolution from './slides/SlideResolution';
import SlideNextSteps from './slides/SlideNextSteps';

const SLIDES = [
  SlideSituational,
  SlideEvidence,
  SlideTrajectory,
  SlideAssurance,
  SlideMembers,
  SlideResolution,
  SlideNextSteps,
];

const STAGE_W = 1280;
const STAGE_H = 720;
const DUR = 7000; // fallback auto-advance duration per slide (ms) when audio is off

// Speaker notes for the current slide (mirrors slideIdForIndex).
const narrationForIndex = (i) => narrationData.narration[slideIdForIndex(i)] || '';

let chatMsgSeq = 0;
const nextChatId = () => `pmc-${++chatMsgSeq}`;

// Full-screen, board-ready slide deck. Launched from the CEO Executive Briefing
// via "View Full Briefing"; the header X is the only exit and returns to
// Conversation Mode. Portaled to <body> so it truly covers the app shell.
export default function PresentationMode({ onClose }) {
  const N = SLIDES.length;
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..100 for the current slide
  const [scale, setScale] = useState(1);
  const [lineageOpen, setLineageOpen] = useState(false);
  const [audioOn, setAudioOn] = useState(true); // audio briefing (narration) on/off

  const narr = useNarration();

  // Presentation Mode chat (scripted). Conversation state lives here so history
  // persists across slide navigation and sheet open/close.
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatChips, setChatChips] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [closingOpen, setClosingOpen] = useState(false);
  const [closingStep, setClosingStep] = useState(0);

  const stagewrapRef = useRef(null);
  const progRef = useRef(0);
  const timerRef = useRef(null);
  const idxRef = useRef(0);
  const chatGenRef = useRef(0);
  const openChatRef = useRef(null);
  const playingRef = useRef(false);
  const audioOnRef = useRef(true);

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { audioOnRef.current = audioOn; }, [audioOn]);

  const slideId = slideIdForIndex(idx);

  // Clamp (no wrapping) so advancing past the last slide never loops to slide 1.
  const go = useCallback((i) => {
    setIdx(Math.max(0, Math.min(N - 1, i)));
    progRef.current = 0;
    setProgress(0);
  }, [N]);

  // The Leadership Next Steps (final) slide ends in the closing modal.
  const openClosing = useCallback((step = 0) => {
    narr.cancel();
    setChatOpen(false);
    setLineageOpen(false);
    setPlaying(false);
    setClosingStep(step);
    setClosingOpen(true);
  }, [narr]);

  // Next on the last slide opens the closing modal instead of wrapping.
  const next = useCallback(() => {
    if (idx >= N - 1) openClosing(0);
    else go(idx + 1);
  }, [go, idx, N, openClosing]);
  const prev = useCallback(() => go(idx - 1), [go, idx]);

  // Narrate the current slide's highlights on demand. When it ends it simply
  // stops on the same slide — no auto-advance. The CEO drives navigation, and
  // audio only plays when Play is clicked for a given slide.
  const speakSlide = useCallback((i) => {
    if (!audioOnRef.current || !narr.supported) return;
    progRef.current = 0;
    setProgress(0);
    narr.speak(slideIdForIndex(i), narrationForIndex(i), {
      nextSlideId: i + 1 < N ? slideIdForIndex(i + 1) : undefined,
      onProgress: (p) => setProgress(Math.round(p * 100)),
      onEnd: () => { setPlaying(false); },
    });
  }, [narr, N]);

  // Scale the fixed 1280x720 stage to fit the letterbox (viewport minus chrome).
  useEffect(() => {
    function fit() {
      const el = stagewrapRef.current;
      if (!el) return;
      const f = Math.min((el.clientWidth - 32) / STAGE_W, (el.clientHeight - 16) / STAGE_H);
      setScale(f > 0 ? f : 1);
    }
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // Lock background scroll while the deck is open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  // Keyboard navigation. While the closing modal is open it owns the keyboard
  // (its own capture-phase Escape), so the deck ignores keys to avoid navigating
  // the slide behind it.
  useEffect(() => {
    function onKey(e) {
      if (closingOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { prev(); }
      else if (e.key === 'Escape') { onClose?.(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onClose, closingOpen]);

  // Open the lineage overlay from the Assurance slide's Lineage-on-Demand widget.
  // Lineage and chat are mutually exclusive — one contextual surface at a time.
  useEffect(() => {
    const open = () => { narr.cancel(); setPlaying(false); setChatOpen(false); setLineageOpen(true); };
    window.addEventListener('ussfcu-ceo-deck:open-lineage', open);
    return () => window.removeEventListener('ussfcu-ceo-deck:open-lineage', open);
  }, [narr]);

  // Keep a live idx for handlers fired from window events; refresh the chat's
  // suggested questions to the new slide when navigating with the sheet open.
  useEffect(() => {
    idxRef.current = idx;
    if (chatOpen) setChatChips(suggestionsFor(slideIdForIndex(idx)));
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open the chat sheet from an interactive slide element (seeded question).
  useEffect(() => {
    const h = (e) => openChatRef.current?.(e.detail?.seed);
    window.addEventListener('ussfcu-ceo-deck:open-chat', h);
    return () => window.removeEventListener('ussfcu-ceo-deck:open-chat', h);
  }, []);

  // Open the step-detail modal from the final slide's next-step cards.
  useEffect(() => {
    const h = (e) => { narr.cancel(); setChatOpen(false); setLineageOpen(false); setPlaying(false); setClosingStep(e.detail?.step ?? 0); setClosingOpen(true); };
    window.addEventListener('ussfcu-ceo-deck:open-closing', h);
    return () => window.removeEventListener('ussfcu-ceo-deck:open-closing', h);
  }, [narr]);

  // Fallback auto-advance (fixed 7s wall-clock) — only when audio narration is
  // off or unsupported. When audio is on, narration end drives the advance.
  useEffect(() => {
    if (!playing) return undefined;
    if (audioOn && narr.supported) return undefined;
    timerRef.current = setInterval(() => {
      progRef.current += 100;
      setProgress(Math.min(100, (progRef.current / DUR) * 100));
      if (progRef.current >= DUR) setPlaying(false); // stop on the slide — no auto-advance
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [playing, N, audioOn, narr.supported]);

  // Navigating between slides stops any playing narration and resets to paused —
  // audio never auto-plays on a slide change; the CEO must click Play each time.
  useEffect(() => {
    narr.cancel();
    setPlaying(false);
    progRef.current = 0;
    setProgress(0);
    return undefined;
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // The briefing does NOT auto-start — it begins only when the CEO clicks Play.
  // Just disable audio if TTS is unavailable, and cancel narration on unmount.
  useEffect(() => {
    if (!narr.supported) setAudioOn(false);
    return () => narr.cancel();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pause narration when the tab is hidden; resume if still playing on return.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) narr.pause();
      else if (playingRef.current && audioOnRef.current) narr.resume();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [narr]);

  const togglePlay = () => {
    if (playing) {
      narr.pause();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    playingRef.current = true;
    if (audioOnRef.current && narr.supported) {
      if (narr.isPaused()) narr.resume();
      else speakSlide(idx);
    } else {
      progRef.current = 0;
      setProgress(0);
    }
  };

  // Silence/enable the audio briefing without stopping the deck.
  const toggleAudio = () => {
    setAudioOn((on) => {
      const next = !on;
      audioOnRef.current = next;
      if (!next) {
        narr.cancel();
        progRef.current = 0;
        setProgress(0);
      } else if (playingRef.current) {
        speakSlide(idxRef.current);
      }
      return next;
    });
  };

  // Download PDF → the approved board-ready PDF leave-behind, served from
  // /public. Triggers a real file download of the same briefing.
  const handleDownloadPdf = () => {
    narr.cancel();
    setPlaying(false);
    const a = document.createElement('a');
    a.href = '/USSFCU_CEO_Presentation_Mode.pdf';
    a.download = 'USSFCU_CEO_Presentation_Mode.pdf';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ─── Scripted chat ───────────────────────────────────────────────
  // Push the user question, simulate "thinking", then push the scripted answer
  // and its follow-up chips. Generation-guard drops stale timeouts.
  const deliver = (userText, ans) => {
    const gen = ++chatGenRef.current;
    setChatMessages((prev) => [...prev, { id: nextChatId(), role: 'user', text: userText }]);
    setIsTyping(true);
    setChatChips([]);
    setTimeout(() => {
      if (gen !== chatGenRef.current) return;
      setIsTyping(false);
      setChatMessages((prev) => [...prev, { id: nextChatId(), role: 'ai', text: ans.a, sources: ans.sources, confidence: ans.confidence }]);
      setChatChips(ans.followups || []);
      if (ans.action === 'lineage') { setChatOpen(false); setLineageOpen(true); }
    }, 1100 + Math.random() * 600);
  };

  const sendAsk = (text) => {
    const t = (text || '').trim();
    if (!t) return;
    deliver(t, resolve(t, slideIdForIndex(idxRef.current)));
  };

  const seedAsk = (id) => {
    const q = findById(id);
    if (q) deliver(q.q, q);
  };

  const openChat = (seed) => {
    narr.cancel();
    setLineageOpen(false);
    setPlaying(false);
    setChatOpen(true);
    if (seed) { seedAsk(seed); return; }
    setChatMessages((prev) => (prev.length ? prev : [{ id: nextChatId(), role: 'ai', text: greeting() }]));
    setChatChips((prev) => (prev.length ? prev : suggestionsFor(slideIdForIndex(idxRef.current))));
  };
  openChatRef.current = openChat;

  const submitAsk = () => {
    const t = chatInput.trim();
    if (!t) return;
    narr.cancel();
    setLineageOpen(false);
    setPlaying(false);
    setChatOpen(true);
    sendAsk(t);
    setChatInput('');
  };

  const deck = (
    <div className="pm-root" role="dialog" aria-modal="true" aria-label="USSFCU CEO Executive Briefing">
      {/* Header */}
      <div className="topbar">
        <div className="brand">
          <span className="hlogo"><img src="/ussfcu-seal.png" alt="United States Senate Federal Credit Union" /></span>
          <span className="hsub">{pres.meta.eyebrow}</span>
        </div>
        <div className="topright">
          <span className="conf-line">{pres.meta.confidenceLine}</span>
          <button type="button" className="pdfbtn" onClick={handleDownloadPdf} title="Download PDF report">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
            <span className="pdfbtn-label">Download PDF</span>
          </button>
          <button type="button" className="x" onClick={onClose} title="Exit to conversation" aria-label="Close briefing">&#10005;</button>
        </div>
      </div>

      {/* Stage */}
      <div className="stagewrap" ref={stagewrapRef}>
        <div
          className="stage"
          style={{ transform: `scale(${scale})` }}
        >
          {SLIDES.map((Slide, i) => (
            <Slide key={i} active={i === idx} />
          ))}
        </div>
      </div>

      {/* Bottom control bar */}
      <div className="controls">
        <div className="progress"><div className="bar" style={{ width: `${progress}%` }} /></div>
        <button type="button" className="play" onClick={togglePlay} aria-label={playing ? 'Pause briefing' : 'Play briefing'}>
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <button type="button" className="navbtn" onClick={prev} aria-label="Previous slide">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button type="button" className="navbtn" onClick={next} aria-label="Next slide">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        <button type="button" className={`navbtn audiobtn${audioOn ? ' on' : ''}`} onClick={toggleAudio} aria-label={audioOn ? 'Mute audio briefing' : 'Play audio briefing'} title={audioOn ? 'Mute audio briefing' : 'Play audio briefing'}>
          {audioOn ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M22 9l-6 6M16 9l6 6" /></svg>
          )}
        </button>
        <div className="askinput">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          <input
            type="text"
            value={chatInput}
            placeholder="Ask AI about this briefing…"
            aria-label="Ask AI about this briefing"
            onFocus={() => openChat()}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); submitAsk(); } }}
          />
          <button type="button" className="send" onClick={submitAsk} aria-label="Send question">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
          </button>
        </div>
        <div className="counter">
          <div className="dots">
            {SLIDES.map((_, i) => (
              <button key={i} type="button" className={`d${i === idx ? ' on' : ''}`} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>
          <div className="cnum">{idx + 1} / {N}</div>
        </div>
      </div>

      {/* Lineage overlay — sibling of the scaled stage so it renders full-size. */}
      <DeckLineageOverlay open={lineageOpen} onClose={() => setLineageOpen(false)} />

      {/* Ask-AI bottom sheet — sibling of the scaled stage, above the control bar. */}
      <PresentationChatSheet
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        slideId={slideId}
        messages={chatMessages}
        isTyping={isTyping}
        chips={chatChips}
        onChip={sendAsk}
      />

      {/* Step-detail modal — reached from the final slide's next-step cards.
          Dismissing returns to the slide; "Return to briefing home" exits the
          whole deck (onClose is the deck's own onClose). */}
      <ClosingModal
        open={closingOpen}
        stepIndex={closingStep}
        onDismiss={() => setClosingOpen(false)}
        onReturnHome={() => { setClosingOpen(false); onClose?.(); }}
        onDownload={handleDownloadPdf}
      />
    </div>
  );

  return createPortal(deck, document.body);
}

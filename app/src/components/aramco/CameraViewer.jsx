/**
 * CameraViewer — one feed, opened large.
 *
 * Built on the same primitives `MaximizablePanel` uses (a portal, the
 * framer-motion backdrop, Escape to close, a locked body) so it sits in the app
 * as a familiar object. It is not that component, because the shapes differ:
 * `MaximizablePanel` grows a panel that is already on the page, and this opens
 * on a selection and has no inline half.
 *
 * The transport is ours rather than the browser's `controls` attribute. Native
 * chrome is the one thing on the page that cannot be themed, and it renders
 * differently in every browser the demo might run in — which is exactly the
 * kind of detail that draws the eye in a room where someone is presenting.
 *
 * **Audio has one rule and it is enforced here:** a feed opens muted. Sound is
 * a deliberate act on a single camera, so no arrangement of hovering, opening
 * and closing can produce two audible feeds at once.
 *
 * The split into two components is what makes "opening a second camera starts
 * clean" structural rather than careful: the body is keyed by camera id, so
 * switching feeds remounts it and every piece of transport state goes back to
 * its initial value. There is no reset to forget to write.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Loader2, Maximize, Minimize, Pause, Play, Users, Volume2, VolumeX, X,
} from 'lucide-react';

/** mm:ss — the clips are seconds long, so hours would be noise. */
function clock(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

const BTN = 'inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default';

function ViewerBody({ camera, zone, breaches, onClose }) {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const dialogRef = useRef(null);
  const restoreFocus = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [failed, setFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  // While the pointer owns the scrubber, timeupdate must not fight it back.
  const scrubbing = useRef(false);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || failed) return;
    if (v.paused) v.play().catch(() => setFailed(true));
    else v.pause();
  }, [failed]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    // Unmuting at zero volume is a dead control; give it something to hear.
    if (v.muted && v.volume === 0) { v.volume = 0.8; setVolume(0.8); }
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const seekBy = useCallback((delta) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else frame.requestFullscreen?.().catch(() => { /* denied — stay windowed */ });
  }, []);

  useEffect(() => {
    restoreFocus.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { onClose?.(); return; }
      // Leave the range inputs their own arrow keys.
      if (e.target instanceof HTMLInputElement && e.target.type === 'range' && e.key !== ' ') return;
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); seekBy(-5); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); seekBy(5); }
      else if (e.key === 'm' || e.key === 'M') toggleMute();
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    document.addEventListener('keydown', onKey);

    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFs);
      document.body.style.overflow = previousOverflow;
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      restoreFocus.current?.focus?.();
    };
  }, [onClose, togglePlay, seekBy, toggleMute, toggleFullscreen]);

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <motion.div
      ref={dialogRef}
      tabIndex={-1}
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border border-border-subtle bg-surface w-full max-w-5xl max-h-full flex flex-col overflow-hidden shadow-2xl focus:outline-none"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={`${camera.id}, ${camera.name}`}
    >
      <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-3 border-b border-border-subtle">
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold text-text tracking-tight truncate">{camera.name}</h3>
          <p className="text-[11px] text-text-subtle mt-0.5 truncate">
            <span className="font-mono">{camera.id}</span> · {camera.unit} · {camera.view}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {breaches > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-rose-700/25 bg-rose-700/10 px-2 py-1 text-[10px] font-bold text-rose-700">
              <AlertTriangle className="w-3 h-3" />
              {breaches} permit {breaches === 1 ? 'breach' : 'breaches'} in view
            </span>
          )}
          {zone && (
            <span className="hidden md:inline-flex items-center gap-1 text-[10.5px] text-text-muted">
              <Users className="w-3.5 h-3.5" /> {zone.people.toLocaleString()} in zone
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close the camera"
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-border bg-surface-2 text-text-subtle hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div ref={frameRef} className="relative bg-slate-950 flex-shrink-0">
        {failed ? (
          <div className="w-full aspect-[32/15] flex flex-col items-center justify-center gap-2 px-6 text-center">
            <AlertTriangle className="w-6 h-6 text-white/50" />
            <p className="text-[12px] font-semibold text-white/85">This feed could not be played</p>
            <p className="text-[11px] text-white/50">
              {camera.id} — the file may be missing, or the format is not supported here.
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={camera.src}
            poster={camera.poster}
            preload="metadata"
            autoPlay
            muted
            loop
            playsInline
            className="w-full max-h-[64vh] aspect-[32/15] object-contain bg-slate-950"
            onClick={togglePlay}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onWaiting={() => setBuffering(true)}
            onPlaying={() => setBuffering(false)}
            onCanPlay={() => setBuffering(false)}
            onError={() => { setFailed(true); setBuffering(false); }}
            onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration); e.currentTarget.volume = volume; }}
            onTimeUpdate={(e) => { if (!scrubbing.current) setTime(e.currentTarget.currentTime); }}
          />
        )}

        {buffering && !failed && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 className="w-6 h-6 text-white/85 animate-spin" />
          </span>
        )}
      </div>

      <div className="px-4 sm:px-5 py-3 bg-slate-900 flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <span className="text-[10.5px] font-mono text-white/70 tabular-nums w-9">{clock(time)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.05}
            value={time}
            disabled={failed || !duration}
            aria-label="Seek"
            onPointerDown={() => { scrubbing.current = true; }}
            onPointerUp={() => { scrubbing.current = false; }}
            onChange={(e) => {
              const next = Number(e.target.value);
              setTime(next);
              if (videoRef.current) videoRef.current.currentTime = next;
            }}
            className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer accent-white disabled:cursor-default"
            style={{ background: `linear-gradient(to right, #fff ${pct}%, rgba(255,255,255,0.22) ${pct}%)` }}
          />
          <span className="text-[10.5px] font-mono text-white/45 tabular-nums w-9">{clock(duration)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={togglePlay} disabled={failed} title={playing ? 'Pause (Space)' : 'Play (Space)'} aria-label={playing ? 'Pause' : 'Play'} className={`${BTN} w-9 h-9`}>
            {playing ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 translate-x-[1px]" fill="currentColor" />}
          </button>

          <button type="button" onClick={toggleMute} disabled={failed} title={muted ? 'Unmute (M)' : 'Mute (M)'} aria-label={muted ? 'Unmute' : 'Mute'} className={`${BTN} w-9 h-9`}>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            disabled={failed}
            aria-label="Volume"
            onChange={(e) => {
              const next = Number(e.target.value);
              setVolume(next);
              const v = videoRef.current;
              if (!v) return;
              v.volume = next;
              // Moving the slider off zero is an unmute in every player people
              // already use.
              v.muted = next === 0;
              setMuted(v.muted);
            }}
            className="w-20 sm:w-24 h-1.5 appearance-none rounded-full bg-white/22 cursor-pointer accent-white disabled:cursor-default"
          />

          <span className="ml-1 hidden sm:inline-flex items-center gap-1.5 rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live
          </span>

          <span className="ml-auto hidden md:inline text-[10px] text-white/35">
            Space play · ← → seek · M mute · F fullscreen · Esc close
          </span>

          <button type="button" onClick={toggleFullscreen} disabled={failed} title={fullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} className={`${BTN} w-9 h-9 md:ml-2`}>
            {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Deliberately no `AnimatePresence` here, and therefore no exit animation.
 *
 * On framer-motion 12.38 an exited child in this app is animated to opacity 0
 * but never actually unmounted — the same thing happens to `MaximizablePanel`,
 * where the leftover collapses to a 16px corner node nobody notices. A camera
 * cannot afford that: an unmounted-but-present dialog keeps its `<video>`
 * playing, keeps the audio on, and keeps the body scroll lock applied, so
 * closing a feed would leave a demo talking to itself.
 *
 * Mounting on a plain condition makes closing a React unmount: the element goes,
 * playback stops with it, and the effect cleanup restores the page. The opening
 * animation — which is the half anyone actually sees — is untouched.
 */
export default function CameraViewer({ camera, zone, breaches = 0, onClose }) {
  if (typeof document === 'undefined' || !camera) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[130] bg-slate-950/70 backdrop-blur-[2px] p-2 sm:p-6 flex items-center justify-center"
      onClick={onClose}
      role="presentation"
    >
      <ViewerBody key={camera.id} camera={camera} zone={zone} breaches={breaches} onClose={onClose} />
    </motion.div>,
    document.body,
  );
}

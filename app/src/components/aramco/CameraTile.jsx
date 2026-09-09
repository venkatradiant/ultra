/**
 * CameraTile — one fixed camera in the wall.
 *
 * Three things shape how this is built:
 *
 *  • **The footage already carries its own chrome.** Each clip has the camera
 *    ID burned into the top-left and a LIVE badge top-right, the way a real VMS
 *    export does. Drawing our own badges over the frame would double every
 *    label, so everything this component adds sits in a caption bar *under* the
 *    picture — where it can also carry things the footage cannot know, like the
 *    zone's live headcount and whether a permit breach is running in shot.
 *
 *  • **One video plays at a time.** These are 1080-line clips; six decoding at
 *    once is a stall on the kind of connection a demo room has. The tile holds
 *    no autoplay policy of its own — the wall decides which tile is previewing
 *    and this one obeys, so the invariant is enforced in a single place.
 *
 *  • **Nothing is fetched until it is wanted.** `preload="none"` means a tile
 *    costs one poster image until someone hovers it. The poster is what makes
 *    that acceptable: the wall reads as six cameras before a byte of video
 *    moves.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CameraOff, Loader2, Play, Users } from 'lucide-react';

// Matches the map legend's swatch, so a hazard tier means the same colour on
// the camera wall as it does on the site plan.
const HAZARD_DOT = { high: 'bg-rose-500', medium: 'bg-amber-500', low: 'bg-slate-400' };

/**
 * Asked once, not per tile. An empty string means the browser will not play
 * H.264 in MP4 at all — rare, but it earns a stated reason instead of a black
 * rectangle.
 */
const CAN_PLAY_MP4 = typeof document === 'undefined'
  ? 'probably'
  : document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028, mp4a.40.2"');

export default function CameraTile({
  camera, zone, breaches = 0, previewing = false, onPreview, onOpen,
}) {
  const videoRef = useRef(null);
  // idle → nothing loaded yet · buffering → fetching · playing · error
  const [state, setState] = useState('idle');
  const [posterFailed, setPosterFailed] = useState(false);

  const offline = camera.status !== 'online';
  const unsupported = CAN_PLAY_MP4 === '';
  const broken = state === 'error' || offline || unsupported;

  // Honour the OS setting rather than the pointer: someone who has asked for
  // less motion should get a still wall, and can still open a feed deliberately.
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    if (typeof matchMedia !== 'function') return undefined;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // The wall grants the preview; this effect is the tile acting on it. It only
  // commands the element — every state change comes back through the media
  // events below, so what the spinner says is what the video is actually doing
  // rather than what we hoped it would do.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || broken) return;

    if (previewing && !reducedMotion) {
      // A muted play() is allowed by every autoplay policy we target, but a
      // rejection here is still not a broken camera — the poster is a complete
      // answer, so it falls back rather than reporting a fault.
      video.play().catch(() => {});
    } else {
      video.pause();
      // Rewind so the next hover opens on the establishing frame rather than
      // wherever the pointer happened to leave it.
      try { video.currentTime = 0; } catch { /* not seekable yet */ }
    }
  }, [previewing, reducedMotion, broken]);

  const hover = useCallback((on) => onPreview?.(on ? camera.id : null), [onPreview, camera.id]);

  const open = useCallback(() => { if (!broken) onOpen?.(camera); }, [broken, onOpen, camera]);

  const statusTone = offline
    ? 'text-rose-700 bg-rose-700/10 border-rose-700/25'
    : 'text-emerald-700 bg-emerald-500/10 border-emerald-600/25';

  return (
    <div className="rounded-xl border border-border-subtle bg-surface overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={open}
        onMouseEnter={() => hover(true)}
        onMouseLeave={() => hover(false)}
        onFocus={() => hover(true)}
        onBlur={() => hover(false)}
        disabled={broken}
        aria-label={broken ? `${camera.id} unavailable` : `Open ${camera.id}, ${camera.name}`}
        className={`group relative block w-full aspect-[32/15] bg-slate-900 overflow-hidden ${
          broken ? 'cursor-default' : 'cursor-pointer'
        } focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand`}
      >
        {/* Sits behind everything, so a missing poster degrades to a framed
            placeholder rather than a hole in the grid. */}
        <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <CameraOff className="w-6 h-6 text-white/25" />
        </span>

        {!broken && (
          <video
            ref={videoRef}
            src={camera.src}
            poster={posterFailed ? undefined : camera.poster}
            preload="none"
            muted
            loop
            playsInline
            tabIndex={-1}
            aria-hidden="true"
            className="relative w-full h-full object-cover"
            onError={() => setState('error')}
            onWaiting={() => setState('buffering')}
            onPlaying={() => setState('playing')}
            onPause={() => setState((s) => (s === 'error' ? s : 'idle'))}
          />
        )}

        {/* The poster is fetched by the <video> itself; this probe exists only
            to notice a 404 so the placeholder behind can take over. */}
        {!broken && !posterFailed && (
          <img src={camera.poster} alt="" aria-hidden="true" className="hidden" onError={() => setPosterFailed(true)} />
        )}

        {state === 'buffering' && (
          <span className="absolute inset-0 flex items-center justify-center bg-slate-950/35">
            <Loader2 className="w-5 h-5 text-white/85 animate-spin" />
          </span>
        )}

        {/* Only drawn while still — once the feed moves it is its own affordance. */}
        {!broken && state !== 'playing' && (
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-slate-950/55 backdrop-blur-[2px] border border-white/25">
              <Play className="w-5 h-5 text-white translate-x-[1px]" fill="currentColor" />
            </span>
          </span>
        )}

        {broken && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center">
            <CameraOff className="w-5 h-5 text-white/50" />
            <span className="text-[11px] font-semibold text-white/80">
              {unsupported ? 'Format not supported in this browser' : 'Feed unavailable'}
            </span>
            <span className="text-[10px] text-white/45 font-mono">{camera.id}</span>
          </span>
        )}
      </button>

      <div className="px-3 py-2.5 border-t border-border-subtle">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-text truncate">{camera.name}</p>
            <p className="text-[10.5px] text-text-subtle truncate mt-0.5">
              <span className="font-mono">{camera.id}</span> · {camera.view}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide flex-shrink-0 ${statusTone}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${offline ? 'bg-rose-600' : 'bg-emerald-500'}`} />
            {offline ? 'Offline' : 'Live'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-text-muted">
            <span className={`w-2 h-2 rounded-sm opacity-70 ${HAZARD_DOT[camera.hazard] ?? HAZARD_DOT.low}`} />
            <span className="capitalize">{camera.hazard} hazard</span>
          </span>

          {/* Read from the site fixture the map reads, so this figure and the
              zone polygon's figure can never disagree. */}
          {zone && (
            <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
              <Users className="w-3 h-3" /> {zone.people.toLocaleString()} in zone
            </span>
          )}
          {!zone && camera.gateId && (
            <span className="text-[10px] text-text-muted">Access control · {camera.gateId}</span>
          )}

          {breaches > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-rose-700/25 bg-rose-700/10 px-1.5 py-0.5 text-[9.5px] font-bold text-rose-700">
              <AlertTriangle className="w-3 h-3" />
              {breaches} permit {breaches === 1 ? 'breach' : 'breaches'} in view
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

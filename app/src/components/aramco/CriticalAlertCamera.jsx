/**
 * CriticalAlertCamera — the incident feed, playing inside the drawer.
 *
 * The alert used to answer "View Live Camera" by navigating to the camera wall.
 * That was the single worst thing about it: the one moment the product exists to
 * show — tag telemetry, permit state and a picture of the place, all true at
 * once — was split across two pages, and getting back cost Gina her place in the
 * conversation. So the feed comes to the incident instead.
 *
 * It is deliberately not `CameraTile`. A tile is a thumbnail in a grid that
 * previews on hover and opens elsewhere on click; this is the one feed that
 * matters, already chosen, playing in a column 440px wide. What it borrows from
 * the tile is the part worth borrowing: the clip carries its own burned-in
 * camera ID and LIVE badge the way a real VMS export does, so nothing is drawn
 * over the picture, and a missing poster or an unplayable codec degrades to a
 * framed placeholder rather than a black hole.
 *
 * **Audio starts muted and stays hers.** Sound in a demo room is a deliberate
 * act, never a side effect of a panel opening.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraOff, Loader2, Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';

/**
 * Asked once, not per render. An empty string means the browser will not play
 * H.264 in MP4 at all — rare, but it earns a stated reason instead of a black
 * rectangle.
 */
const CAN_PLAY_MP4 = typeof document === 'undefined'
  ? 'probably'
  : document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028, mp4a.40.2"');

const CTL = 'inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default';

export default function CriticalAlertCamera({ camera, autoPlay = false, onOpenWall, wallLabel }) {
  const videoRef = useRef(null);
  // idle → nothing loaded yet · buffering → fetching · playing · error
  const [state, setState] = useState('idle');
  const [muted, setMuted] = useState(true);
  const [posterFailed, setPosterFailed] = useState(false);

  const offline = camera?.status !== 'online';
  const unsupported = CAN_PLAY_MP4 === '';
  const broken = state === 'error' || offline || unsupported || !camera;

  // Honour the OS setting rather than the pointer: someone who has asked for
  // less motion gets a still frame and a play button, not a feed that starts
  // moving because an alert arrived.
  const [reducedMotion] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // The drawer grants the play; this effect is the element acting on it. Every
  // state change comes back through the media events below, so the spinner
  // reports what the video is doing rather than what we asked it to do.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || broken) return;
    if (autoPlay && !reducedMotion) {
      // A muted play() is allowed by every autoplay policy we target. A
      // rejection is still not a broken camera — the poster is a complete
      // answer, so it falls back to the play button rather than an error.
      video.play().catch(() => {});
    }
  }, [autoPlay, reducedMotion, broken]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video || broken) return;
    if (video.paused) video.play().catch(() => {}); else video.pause();
  }, [broken]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const playing = state === 'playing';

  return (
    <div className="rounded-xl border border-border-subtle bg-surface overflow-hidden">
      <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
        {/* Sits behind everything, so a missing poster degrades to a framed
            placeholder rather than a hole in the drawer. */}
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
        {!broken && !playing && (
          <button
            type="button"
            onClick={toggle}
            aria-label={`Play ${camera.id}`}
            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
          >
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-950/55 backdrop-blur-[2px] border border-white/25 group-hover:bg-slate-950/70 transition-colors">
              <Play className="w-5 h-5 text-white translate-x-[1px]" fill="currentColor" />
            </span>
          </button>
        )}

        {broken && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center">
            <CameraOff className="w-5 h-5 text-white/50" />
            <span className="text-[11px] font-semibold text-white/80">
              {unsupported ? 'Format not supported in this browser' : 'Feed unavailable'}
            </span>
            {camera && <span className="text-[10px] text-white/45 font-mono">{camera.id}</span>}
          </span>
        )}

        {/* Transport, over the picture and only once it is moving. Ours rather
            than the browser's `controls`, which is the one thing on the page
            that cannot be themed and renders differently in every browser a
            demo might run in. */}
        {!broken && playing && (
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-end gap-1.5 p-2 bg-gradient-to-t from-slate-950/70 to-transparent">
            <button type="button" onClick={toggle} aria-label="Pause" className={`${CTL} w-7 h-7`}>
              <Pause className="w-3.5 h-3.5" fill="currentColor" />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className={`${CTL} w-7 h-7`}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {camera && (
        <div className="px-3 py-2 border-t border-border-subtle flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11.5px] font-bold text-text truncate">{camera.name}</p>
            <p className="text-[10px] text-text-subtle truncate mt-0.5">
              <span className="font-mono">{camera.id}</span> · {camera.view}
            </p>
          </div>
          {onOpenWall && (
            <button
              type="button"
              onClick={onOpenWall}
              className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand hover:underline cursor-pointer flex-shrink-0"
            >
              <Maximize2 className="w-3 h-3" />
              {wallLabel ?? 'Full wall'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

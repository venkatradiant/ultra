import { useState } from 'react';

// Editorial photo panel with a graceful fallback. Attempts the supplied image;
// if there is none, or it cannot load (offline / CSP), it falls back to a
// duotone navy gradient so the slide always reads as designed, never broken.
//
// ESFCU ships with no `src`: no member photography is licensed for this build,
// and the images on esfcu.org are not ours to embed. The designer points `src`
// at brand-kit originals when they arrive — nothing else has to change.
export default function DeckPhoto({ className, src, alt, caption, capClass }) {
  const [failed, setFailed] = useState(!src);
  return (
    <div
      className={className}
      style={failed ? { background: 'linear-gradient(135deg,#0A4A80 0%,#003768 55%,#00243F 100%)' } : undefined}
      role={failed ? 'img' : undefined}
      aria-label={failed ? alt : undefined}
    >
      {!failed && <img src={src} alt={alt} onError={() => setFailed(true)} />}
      {caption ? <span className={capClass}>{caption}</span> : null}
    </div>
  );
}

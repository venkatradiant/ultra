import { useState } from 'react';

// Editorial photo panel with a graceful fallback. Attempts the USSFCU member
// photograph; if it cannot load (offline / CSP), it falls back to a duotone
// navy gradient so the slide always reads as designed, never broken. In
// production the designer swaps in higher-resolution originals from the brand kit.
export default function DeckPhoto({ className, src, alt, caption, capClass }) {
  const [failed, setFailed] = useState(!src);
  return (
    <div
      className={className}
      style={failed ? { background: 'linear-gradient(135deg,#123A5E 0%,#0A2A47 55%,#06182B 100%)' } : undefined}
    >
      {!failed && <img src={src} alt={alt} onError={() => setFailed(true)} />}
      {caption ? <span className={capClass}>{caption}</span> : null}
    </div>
  );
}

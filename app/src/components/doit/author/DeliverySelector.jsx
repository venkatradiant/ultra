import { Check } from 'lucide-react';
import DoitCard from '../shared/DoitCard';
import { StandardsStatusBar, StatusBadge } from '../shared/TrustBits';
import { useAuthorState, setAuthorState } from '../shared/authorState';
import { NATIVE_FORMATS, NATIVE_IDS, PLATFORM_TARGETS } from '../../../data/doit/_shared/deliveryFormats';

/**
 * One survey definition, many delivery channels.
 *
 * The disabled Google Forms row is not an oversight — it is the honest half of
 * the story. "Some channels are wired and some are not yet" is more credible
 * than three green ticks, and it is what a real integration surface looks like.
 */
export default function DeliverySelector() {
  const { formats } = useAuthorState();
  const nativeCount = formats.filter((id) => NATIVE_IDS.has(id)).length;

  const toggle = (id) =>
    setAuthorState({
      formats: formats.includes(id) ? formats.filter((f) => f !== id) : [...formats, id],
    });

  return (
    <DoitCard
      eyebrow="Delivery formats"
      intro="Select one or more. Every format is generated from the same single survey definition."
      footer={
        nativeCount === 0 ? (
          <p className="text-[12px] font-semibold text-warning">Select at least one format.</p>
        ) : (
          <StandardsStatusBar>
            {nativeCount} format{nativeCount > 1 ? 's' : ''} selected — all accessibility-conformant.
          </StandardsStatusBar>
        )
      }
    >
      <div className="space-y-2">
        {NATIVE_FORMATS.map((format) => (
          <FormatOption
            key={format.id}
            selected={formats.includes(format.id)}
            onToggle={() => toggle(format.id)}
            name={format.name}
            desc={format.desc}
            badge={format.recommended ? <StatusBadge label="Recommended" variant="ready" /> : null}
          />
        ))}
      </div>

      <div className="my-3 border-t border-border-subtle pt-3">
        <p className="text-[12px] font-semibold text-text">Or publish to an existing platform</p>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-text-muted">
          VOCE reformats the survey and pushes it through each platform&rsquo;s API. Responses sync back
          for cross-platform analysis.
        </p>
      </div>

      <div className="space-y-2">
        {PLATFORM_TARGETS.map((platform) => (
          <FormatOption
            key={platform.id}
            selected={formats.includes(platform.id)}
            onToggle={() => toggle(platform.id)}
            disabled={!platform.connected}
            name={platform.name}
            desc={platform.desc}
            badge={
              <StatusBadge
                label={platform.connected ? 'Connected' : 'Not connected'}
                variant={platform.connected ? 'connected' : 'disconnected'}
              />
            }
          />
        ))}
      </div>
    </DoitCard>
  );
}

function FormatOption({ selected, onToggle, disabled, name, desc, badge }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      aria-pressed={disabled ? undefined : selected}
      aria-disabled={disabled || undefined}
      className={`flex w-full min-h-[44px] items-start gap-2.5 rounded-lg border-2 p-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        disabled
          ? 'cursor-not-allowed border-border-subtle bg-surface-2 opacity-60'
          : selected
            ? 'border-brand bg-brand/[0.05]'
            : 'border-border-subtle bg-surface hover:border-brand/35'
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded border-2 ${
          selected ? 'border-brand bg-brand text-white' : 'border-border bg-surface'
        }`}
      >
        {selected && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-[12.5px] font-semibold text-text">{name}</span>
          {badge}
        </span>
        <span className="mt-0.5 block text-[11.5px] leading-relaxed text-text-muted">{desc}</span>
      </span>
    </button>
  );
}

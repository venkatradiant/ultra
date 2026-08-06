/**
 * MapFeatureCard — what opens when you click something on the site map.
 *
 * Modelled directly on the deployed TrackLynk (Synapse) RTLS console, which
 * answers every click on the Site View with the same card shape: a square icon
 * tile in the feature's own colour, the feature name, a type chip under it, and
 * then a short stack of labelled fields. Zones get description; devices get
 * coordinates; people get their entity ID, tag ID, tag type, event type,
 * location and coordinates.
 *
 * Keeping that shape is the point. An operator who already works in that
 * console should not have to learn a second grammar for the same object, and
 * the fields it chose to show are the fields that turn out to matter at an
 * alarm: *which tag*, *what type*, *inside which zone*.
 *
 * The card is a plain positioned div rather than a MapLibre Popup: popups
 * anchor to a lng/lat and fight the freeze-on-scroll remount, and this needs to
 * survive a camera move without re-rendering the map.
 */
import { X, Radio, Wifi, TriangleAlert, Building2, DoorOpen, HardHat, Users } from 'lucide-react';
import { formatLatLng } from '../../lib/rtlsIdentity';

const ZONE_ICON = {
  hazard: TriangleAlert,
  building: Building2,
  access: DoorOpen,
  muster: Users,
};

const HAZARD_TILE = {
  high: 'bg-rose-600',
  medium: 'bg-amber-500',
  low: 'bg-slate-500',
};

function Field({ label, value, mono }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div>
      <p className="text-[10px] text-text-subtle leading-none">{label}</p>
      <p className={`text-[12px] text-text mt-1 leading-snug ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function Shell({ Icon, tile, title, chip, children, onClose }) {
  return (
    <div className="w-[248px] rounded-xl border border-border-subtle bg-surface shadow-lg overflow-hidden">
      <div className="flex items-start gap-2.5 p-3">
        <span className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${tile}`}>
          <Icon className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-text leading-snug break-words">{title}</p>
          {chip && (
            <span className="inline-block mt-1 rounded-full bg-surface-2 border border-border-subtle px-2 py-0.5 text-[10px] font-semibold text-text-muted">
              {chip}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded text-text-subtle hover:text-text cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="px-3 pb-3 space-y-2.5">{children}</div>
    </div>
  );
}

/**
 * @param {object} props
 * @param {object} props.feature `{ type, ...props }` — see SiteMapPanel.
 * @param {() => void} props.onClose
 */
export default function MapFeatureCard({ feature, onClose }) {
  if (!feature) return null;

  if (feature.type === 'zone') {
    const Icon = ZONE_ICON[feature.icon] || Building2;
    return (
      <Shell
        Icon={Icon}
        tile={HAZARD_TILE[feature.hazard] || HAZARD_TILE.low}
        title={feature.name}
        chip={feature.zoneType}
        onClose={onClose}
      >
        <Field label="Occupancy" value={`${feature.people.toLocaleString()} of ${feature.occupancy.toLocaleString()} capacity`} />
        <Field
          label="Permits"
          value={`${feature.permits} open${feature.highRiskPermits > 0 ? `, ${feature.highRiskPermits} high-risk` : ''}`}
        />
        <Field label="Hazard class" value={`${feature.hazard[0].toUpperCase()}${feature.hazard.slice(1)} hazard`} />
      </Shell>
    );
  }

  if (feature.type === 'infra') {
    const Icon = feature.deviceType === 'Bridgeport' ? Radio : Wifi;
    return (
      <Shell
        Icon={Icon}
        tile={feature.status === 'degraded' ? 'bg-amber-500' : 'bg-slate-700'}
        title={feature.name}
        chip={feature.deviceType}
        onClose={onClose}
      >
        <Field label="Zone" value={feature.zoneName} />
        <Field label="Status" value={feature.status === 'degraded' ? 'Degraded — intermittent reports' : 'Online'} />
        <Field label="Coordinates" value={formatLatLng(feature.coordinates)} mono />
      </Shell>
    );
  }

  if (feature.type === 'entity') {
    return (
      <Shell
        Icon={HardHat}
        tile={feature.role === 'staff' ? 'bg-brand' : 'bg-accent'}
        title={feature.name}
        chip={feature.roleLabel}
        onClose={onClose}
      >
        <Field label="Entity ID" value={feature.entityId} mono />
        <Field label="Tag ID" value={feature.tagId} mono />
        <Field label="Tag Type" value={feature.tagType} />
        <Field label="Event Type" value={feature.eventType || 'N/A'} />
        <Field label="Location" value={feature.location} />
        <Field label="Coordinates" value={formatLatLng(feature.coordinates)} mono />
      </Shell>
    );
  }

  if (feature.type === 'muster') {
    return (
      <Shell Icon={Users} tile="bg-emerald-600" title={feature.name} chip="Muster Zone" onClose={onClose}>
        <Field label="Capacity" value={feature.capacity?.toLocaleString()} />
        <Field label="Catchment radius" value={`${feature.radiusM} m`} />
        <Field label="Coordinates" value={formatLatLng(feature.coordinates)} mono />
      </Shell>
    );
  }

  if (feature.type === 'gate') {
    return (
      <Shell Icon={DoorOpen} tile="bg-slate-700" title={feature.name} chip="Access Control" onClose={onClose}>
        <Field label="Direction" value="Entry and exit" />
        <Field label="Coordinates" value={formatLatLng(feature.coordinates)} mono />
      </Shell>
    );
  }

  return null;
}

/**
 * Derives an entity's RTLS identity from its tag serial.
 *
 * The deployed TrackLynk (Synapse) console models this as three joined things:
 * an **entity** (a person, with an employee number), a **tag** (hardware, with
 * its own serial and type), and an **assignment** between them. What the
 * location feed actually reports is the tag serial; everything an operator
 * reads on the entity card is the join.
 *
 * So the fixture stores the tag serial and nothing else, and this module does
 * the join at read time. Two reasons, and the second is the important one:
 *
 *  1. 2,412 positions × four identity strings is a quarter of a megabyte of
 *     fixture for data that is fully determined by one integer.
 *  2. It keeps the seam honest. When a real feed replaces the fixture it will
 *     deliver tag serials too, and the identity lookup becomes an API call in
 *     exactly this shape rather than a refactor.
 *
 * The names are synthetic and deliberately generic — a fixed pool combined by
 * serial. No one on this site is real, and the demo says so on every panel.
 */

const GIVEN = [
  'Abdullah', 'Faisal', 'Omar', 'Yousef', 'Khalid', 'Tariq', 'Nasser', 'Hamad',
  'Rashid', 'Salim', 'Bilal', 'Imran', 'Arjun', 'Ravi', 'Suresh', 'Vikram',
  'Anil', 'Kiran', 'Rohit', 'Deepak', 'Marco', 'Diego', 'Tomas', 'Andrei',
  'Miguel', 'Ferdinand', 'Joseph', 'Daniel', 'Samuel', 'Peter',
];

const FAMILY = [
  'Al-Harbi', 'Al-Qahtani', 'Al-Dossari', 'Al-Shehri', 'Al-Zahrani', 'Al-Otaibi',
  'Al-Ghamdi', 'Al-Mutairi', 'Reddy', 'Sharma', 'Naidu', 'Verma', 'Gupta', 'Nair',
  'Kumar', 'Rao', 'Silva', 'Cruz', 'Santos', 'Popescu', 'Ionescu', 'Novak',
  'Mensah', 'Okafor', 'Haddad', 'Karim',
];

/** Tag hardware types, split the way the estate actually splits. */
export const TAG_TYPES = {
  staff: 'Badge Agent RF ATEX',
  contractor: 'Smart Tag RF ATEX',
};

/**
 * @param {number} serial Tag serial from the position feed.
 * @param {'staff'|'contractor'} role
 * @param {string} [zoneName] Resolved zone, for the `Inside Zone:` line.
 * @param {number[]} [coordinates] `[lon, lat]`.
 */
export function entityFromTag(serial, role, zoneName, coordinates) {
  const n = Number(serial) || 0;
  // Two independent strides through the pools so adjacent serials do not read
  // as a family — 7 and 13 are coprime with both pool lengths.
  const given = GIVEN[(n * 7) % GIVEN.length];
  const family = FAMILY[(n * 13) % FAMILY.length];
  return {
    name: `${given} ${family}`,
    entityId: `EMP${1000 + n}`,
    tagId: String(n).padStart(5, '0'),
    tagType: TAG_TYPES[role] || TAG_TYPES.contractor,
    roleLabel: role === 'staff' ? 'Operations Staff' : 'Contractor',
    location: zoneName ? `Inside Zone: ${zoneName}` : 'Inside Site',
    coordinates,
  };
}

/** `Lat: 26.51234, Lng: 50.01234` — the console's own coordinate formatting. */
export function formatLatLng(coordinates) {
  if (!coordinates) return null;
  const [lon, lat] = coordinates;
  return `Lat: ${lat.toFixed(5)}, Lng: ${lon.toFixed(5)}`;
}

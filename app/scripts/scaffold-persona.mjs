#!/usr/bin/env node
/**
 * Scaffolds a new persona module under an existing client:
 *
 *   npm run scaffold:persona <domain> <client> <personaId>
 *   e.g. npm run scaffold:persona healthcare riverside-health triage_nurse
 *
 * Generates a manifest.tsx (split-layout stub with inline flows) + index.ts, and
 * prints the follow-up wiring steps. It never overwrites existing files.
 */

import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [domain, client, personaId] = process.argv.slice(2);

if (!domain || !client || !personaId) {
  console.error('Usage: npm run scaffold:persona <domain> <client> <personaId>');
  process.exit(1);
}

const clientKey = client.replace(/-/g, '_');
const pascal = personaId.replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase());
const dir = join(root, 'src/domains', domain, 'clients', client, 'personas', personaId);

const exists = async (p) => access(p).then(() => true).catch(() => false);

const manifest = `import type { ChatFlowConfig, PersonaManifest } from '@core/types';

const flows: ChatFlowConfig = {
  chatFlows: {
    greeting: {
      ai_message: 'Hello. This is the ${personaId} persona greeting — replace me.',
      suggested_chips: ['Tell me more'],
      confidence: 90,
    },
    detail: {
      user_query: 'Tell me more',
      ai_message: 'Detail turn — replace me.',
      suggested_chips: [],
    },
  },
  chipToFlowKey: { 'Tell me more': 'detail' },
  askTurnSequence: ['detail'],
  signalSequence: [],
};

const manifest: PersonaManifest = {
  id: '${personaId}',
  clientId: '${clientKey}',
  domainId: '${domain}',
  identity: { name: 'TODO Name', initials: 'TD', role: 'TODO Role', greeting: 'TODO' },
  capabilities: ['Proactive Intelligence', 'Converged Conversation'],
  flows,
  signals: [],
  dataSources: [],
  layout: 'inline',
  ui: {
    greetingFlowKey: 'greeting',
    initialChips: ['Tell me more'],
    goldenPathChip: { greeting: 'Tell me more' },
    flowKeyToCapabilityTrigger: {},
    stats: [],
    signalToChip: {},
    capabilityCallouts: [],
  },
};

export default manifest;
`;

const index = `import type { PersonaModule } from '@core/types';

export const ${personaId}Persona: PersonaModule = {
  id: '${personaId}',
  identity: { name: 'TODO Name', initials: 'TD', role: 'TODO Role', greeting: 'TODO' },
  load: () => import('./manifest'),
};
`;

const manifestPath = join(dir, 'manifest.tsx');
const indexPath = join(dir, 'index.ts');

if (await exists(manifestPath)) {
  console.error(`Refusing to overwrite ${manifestPath}`);
  process.exit(1);
}

await mkdir(dir, { recursive: true });
await writeFile(manifestPath, manifest);
await writeFile(indexPath, index);

console.log(`✓ Created ${personaId} under ${domain}/${client}\n`);
console.log('Next steps:');
console.log(`  1. Fill in src/domains/${domain}/clients/${client}/personas/${personaId}/manifest.tsx`);
console.log(`  2. Register '${personaId}Persona' in that client's client.manifest.ts (personas: [...])`);
console.log(`  3. If selectable: add '${personaId}' to PersonaContext CLIENT_PERSONAS['${clientKey}'] and to data/personas.js`);
console.log('  4. npm run typecheck && npm test && npm run build');

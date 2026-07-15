/**
 * DomainManifest — the top axis (financial-services, healthcare, retail…).
 * Groups clients and carries domain-wide defaults. This is the axis that did
 * not exist before the North Star refactor.
 */

import type { ClientManifest } from './client';
import type { BrandTheme } from '../theme/tokens';

export interface DomainManifest {
  id: string;
  name: string;
  /** Clients belonging to this domain. */
  clients: ClientManifest[];
  /** Default client id when the domain is entered without one selected. */
  defaultClientId: string;
  /** Optional domain-wide brand theme; clients may override it. */
  theme?: BrandTheme;
}

/** The whole world: every domain the platform can render. */
export type DomainRegistry = DomainManifest[];

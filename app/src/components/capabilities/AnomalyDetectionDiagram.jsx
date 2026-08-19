import { usePersona } from '../../context/PersonaContext';
import { useBranding } from '../../context/BrandingContext';

export default function AnomalyDetectionDiagram() {
  const persona = usePersona();
  const { client } = useBranding();
  const isNFCU = persona.id.startsWith('nfcu_');
  const clientShort = (client?.shortName || 'USSFCU').toUpperCase();

  /* Arrow points UPWARD — matching original SVG: data flows up from sources → platform → AI */
  const UpArrow = () => (
    <div className="flex justify-center flex-shrink-0" style={{ height: 'min(2.2vh, 20px)' }}>
      <svg width="14" height="100%" viewBox="0 0 14 24" fill="none" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <polygon points="7,0 2,8 12,8" fill="var(--color-brand)" />
        <line x1="7" y1="7" x2="7" y2="24" stroke="var(--color-brand)" strokeWidth="1.8" strokeDasharray="4 3" />
      </svg>
    </div>
  );

  const fs = {
    eyebrow:  'clamp(9px,  min(1.5vh, 1.2vw),  16px)',
    title:    'clamp(22px, min(4.2vh, 3.2vw), 42px)',
    subtitle: 'clamp(11px, min(1.9vh, 1.5vw), 19px)',
    body:     'clamp(11px, min(1.8vh, 1.4vw), 18px)',
    label:    'clamp(9px,  min(1.5vh, 1.15vw), 15px)',
    labelSm:  'clamp(8px,  min(1.3vh, 1vw),   14px)',
    cardTitle:'clamp(10px, min(1.6vh, 1.25vw), 17px)',
    cardDesc: 'clamp(9px,  min(1.4vh, 1.1vw),  15px)',
    pill:     'clamp(8px,  min(1.25vh, 1vw),   13px)',
    small:    'clamp(9px,  min(1.3vh, 1vw),    14px)',
  };

  const isCfo = persona.id === 'ussfcu_cfo';
  const isNewfold = persona.id.startsWith('newfold_');
  const isAramco = persona.id.startsWith('aramco_');
  const isAtt = persona.id.startsWith('att_');

  const clientConfig = isAtt ? {
    sourcesLabel: 'BILLING SIGNAL SOURCES',
    primarySources: ['Billing System', 'Rate Card & Plan Catalog', 'Tax-Rule Engine', 'Account & Payment History'],
    secondarySources: ['Usage-Rating Engine', 'Device-Loan Ledger', 'CGCM Sync Log', 'Plan-Feature Entitlements'],
    deployedAt: 'Radiant Solutions Lab',
    deployedDesc: 'Multi-agent orchestration across network ops',
    bodyText: 'Detects out-of-policy charges — missing discounts, duplicate installments, stale tax rates, roaming overcharges — and groups them by shared root cause. The grouping is what matters: 207 individual investigations become six decisions, and the residue that fits no pattern is separated out rather than averaged in.',
    monitorAgents: [
      { name: 'Rule Layer', desc: 'Deterministic policy checks on discounts, tax rates and entitlements — 40% of detections' },
      { name: 'ML Layer', desc: 'Learned detection for the breaks no rule was written for — 30%' },
      { name: 'LLM Edge Review', desc: 'The residue neither layer resolves: edge cases needing a written explanation — 12%' },
      { name: 'Pattern Grouping', desc: 'Collapses anomalies into groups by shared root cause, not by charge type' },
      { name: 'Root Cause Analysis', desc: 'Names the cause in plain language — a CGCM sync failure, a stale tax-rule version' },
    ],
    gapText: 'Detection was never the hard part. Anomalies arrive individually flagged with no shared cause, so every one becomes a small investigation across four systems that do not reconcile — and there are more anomalies than hours in the window.',
    withText: 'Six patterns with a named root cause, a confidence score and a dollar figure each — plus the five edge cases held out where they can get real attention.',
  } : isAramco ? {
    sourcesLabel: 'ARAMCO SIGNAL SOURCES',
    primarySources: ['Permit-to-Work', 'Gate Access-Control', 'Location & Tag Data', 'CCTV & Presence'],
    secondarySources: ['Contractor Timesheets', 'HSE Action Tracker', 'Maintenance Work Orders', 'HSE Reporting'],
    deployedAt: 'Radiant Solutions Lab',
    deployedDesc: 'Multi-agent orchestration across network ops',
    bodyText: 'Flags any job running in a hazard zone without a valid permit, the moment it happens, with the evidence behind each flag — the permit record, the location trail, and the time stamps. An expired permit looks like a closed record until live location sits next to it.',
    monitorAgents: [
      { name: 'Permit Validity Monitor', desc: 'Watches expiry, extension and zone-scope breaches on open permits' },
      { name: 'Hazard Zone Monitor', desc: 'Detects entry into a hazard envelope without matching authorization' },
      { name: 'Condition Monitor', desc: 'Gas-test intervals, standby presence, occupancy limits' },
      { name: 'Pattern Correlator', desc: 'Links permit, location and camera evidence into one flag' },
      { name: 'Evidence Assembler', desc: 'Packages the trail behind every flag for audit' },
    ],
    gapText: 'Permits live in one system and people\'s real locations are unknown or on paper. The gap between authorized work and actual work is invisible exactly when contractor density, and therefore risk, is highest.',
    withText: 'Every job outside its permit conditions flagged in the moment, not after a near-miss or an audit finding.',
  } : isNewfold ? {
    sourcesLabel: 'NEWFOLD DATA SOURCES',
    primarySources: ['Genesys Cloud', 'Billing & Subscriptions', 'Domain Registrar', 'Hosting Control Panel'],
    secondarySources: ['Customer 360', 'Marketing Cloud', 'IT Monitoring', 'Snowflake'],
    deployedAt: 'Radiant Solutions Lab',
    deployedDesc: 'Multi-agent orchestration across network ops',
    bodyText: 'Flags unusual patterns across brands and systems — dunning and billing anomalies, refund spikes, outage-correlated volume, and compliance gaps like a skipped auto-renewal disclosure — before they show up in a report.',
    monitorAgents: [
      { name: 'Billing & Dunning Monitor', desc: 'Watches billing anomalies, refund spikes, and dunning failures' },
      { name: 'Volume Monitor', desc: 'Renewal-batch and outage-correlated contact spikes' },
      { name: 'Adherence Monitor', desc: 'Disclosure and process-deviation detection' },
      { name: 'Pattern Correlator', desc: 'Links anomalies across brands and systems' },
      { name: 'Compliance Scanner', desc: 'Auto-renewal and negative-option disclosure gaps' },
    ],
    gapText: 'The contact center platform reports within its own data. When a renewal batch, a marketing price-increase notice, a hosting outage, and a churn signal collide across brands, no native tool connects those signals.',
    withText: 'Billing anomalies, refund spikes, outage-correlated volume, and disclosure gaps flagged before they escalate.',
  } : isCfo ? {
    bodyText: 'Detects where the same metric diverges across systems, where a transformation silently changes a figure between the ledger and Tableau, and which reconciliation exceptions are aging — surfaced as prioritized, actionable signals.',
    monitorAgents: [
      { name: 'Parity Monitor', desc: 'Watches CFO-vs-Lending figure divergence' },
      { name: 'Reconciliation Monitor', desc: 'Flags GL / ledger / origination breaks' },
      { name: 'Transformation Monitor', desc: 'Catches silent changes ledger-to-Tableau' },
      { name: 'Pattern Correlator', desc: 'Links anomalies across systems' },
      { name: 'Exception Ager', desc: 'Surfaces aging reconciliation exceptions' },
    ],
    sourcesLabel: 'USSFCU SIGNAL SOURCES',
    primarySources: ['Jack Henry Core', 'Thought Machine', 'General Ledger', 'Lending Origination'],
    secondarySources: ['Snowflake', 'Tableau', 'Audit / GRC'],
    deployedAt: 'Radiant Solutions Lab',
    deployedDesc: 'Multi-agent orchestration across network ops',
    gapText: 'A figure can change between the Thought Machine ledger and Tableau with nothing flagging it. Aging reconciliation exceptions stay invisible until the audit runs long.',
    withText: 'Parity breaks and silent transformations caught and scored before the auditor finds them.',
  } : isNFCU ? {
    bodyText: 'Detects unusual patterns across quality scores, contact center volume, compliance flags, and agent performance in real time — and surfaces them as prioritized, actionable signals.',
    monitorAgents: [
      { name: 'Quality Monitor', desc: 'Watches QA scores and compliance flag rates' },
      { name: 'Volume Monitor', desc: 'Contact center and channel call spikes' },
      { name: 'Adherence Monitor', desc: 'Script and process deviation detection' },
      { name: 'Pattern Correlator', desc: 'Links anomalies across systems' },
      { name: 'Compliance Scanner', desc: 'BSA/AML pattern detection' },
    ],
    sourcesLabel: 'NFCU SIGNAL SOURCES',
    primarySources: ['Dynamics 365', 'Quality Mgmt', 'Marketing Cloud', 'Workday'],
    secondarySources: ['Genesys Bridge', 'Snowflake', 'Azure AI', 'ServiceNow'],
    deployedAt: 'Radiant Solutions Lab',
    deployedDesc: 'Multi-agent orchestration across network ops',
    gapText: 'BSA/AML skip rates are buried in process adherence reports. Quality dips go undetected until QA review cycles complete. Cross-system anomalies are invisible.',
    withText: 'Real-time compliance flag detection across all shifts — automatically correlated with script changes, IT incidents, and agent performance patterns.',
  } : {
    bodyText: 'Detects unusual patterns across member transactions, contact center volume, and workflow exceptions in real time, and surfaces them as prioritized, actionable signals.',
    monitorAgents: [
      { name: 'Transaction Monitor', desc: 'Watches payment and loan activity' },
      { name: 'Volume Monitor', desc: 'Contact center and channel spikes' },
      { name: 'Exception Monitor', desc: 'UiPath workflow failures' },
      { name: 'Pattern Correlator', desc: 'Links anomalies across systems' },
      { name: 'Compliance Scanner', desc: 'BSA/AML pattern detection' },
    ],
    sourcesLabel: `${clientShort} SIGNAL SOURCES`,
    primarySources: ['Data Cloud', 'Financial Services Cloud', 'Service Cloud', 'Marketing Cloud'],
    secondarySources: ['Genesys Cloud', 'Snowflake', 'UiPath', 'ICE/LOS'],
    deployedAt: 'Radiant Solutions Lab',
    deployedDesc: 'Across multiple engagements',
    gapText: 'Risk signals are buried in platform-specific dashboards. Cross-system anomalies go unseen.',
    withText: 'Real-time, cross-platform pattern detection with prioritized, auditable alerts.',
  };

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', background: '#FFFFFF', padding: '2.4vh 2vw 2vh' }}
    >
      {/* ── TOP: Capability Identity ── */}
      <div className="flex-shrink-0" style={{ marginBottom: '0.6vh' }}>
        <p style={{ fontSize: fs.eyebrow, color: '#CC0000', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 0.4vh 0' }}>
          RADIANT AI CAPABILITY
        </p>
        <h2 style={{ fontSize: fs.title, color: 'var(--color-brand)', fontWeight: 800, margin: '0 0 0.2vh 0', lineHeight: 1.15 }}>
          Anomaly Detection
        </h2>
        <p style={{ fontSize: fs.subtitle, color: '#666666', fontWeight: 500, margin: '0 0 0.3vh 0' }}>
          Powered by Predictive AI + Agentic Data Platform + Agentic AI
        </p>
        <p style={{ fontSize: fs.body, color: '#333333', fontWeight: 400, margin: 0, lineHeight: 1.5 }}>
          {clientConfig.bodyText}
        </p>
      </div>

      <div style={{ borderBottom: '1px solid #E0E0E0', marginTop: '0.6vh', marginBottom: '1.2vh', flexShrink: 0 }} />

      <p className="flex-shrink-0" style={{ fontSize: fs.labelSm, color: 'var(--color-brand)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 0.5vh 0' }}>
        UNDERLYING ARCHITECTURE
      </p>

      {/* ── ARCHITECTURE DIAGRAM ── */}
      <div className="flex-1 min-h-0 flex flex-col">

        {/* Row 1: Predictive AI + Responsible AI */}
        <div className="flex" style={{ flex: '3 1 0', minHeight: 0, gap: 'min(1vw, 10px)' }}>
          <div
            className="flex-1 flex flex-col"
            style={{ background: 'rgba(0, 48, 135, 0.07)', border: '1.5px solid var(--color-brand)', borderRadius: '8px', padding: 'min(1.2vh, 10px) min(1.2%, 12px)' }}
          >
            <div className="flex items-baseline flex-shrink-0" style={{ marginBottom: 'min(0.8vh, 8px)', gap: 'min(1vw, 12px)' }}>
              <span style={{ fontSize: fs.label, color: 'var(--color-brand)', fontWeight: 700, letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>PREDICTIVE AI</span>
              <span style={{ fontSize: fs.labelSm, color: '#666666', fontWeight: 400 }}>Anomaly scoring, noise reduction, and priority ranking</span>
            </div>
            <div className="flex flex-1 min-h-0" style={{ gap: 'min(0.6vw, 8px)' }}>
              {[
                { name: 'Anomaly Scoring', desc: 'Severity, confidence, and business impact per signal' },
                { name: 'Alert Noise Reduction', desc: 'ML filtering separates true positives from false alarms' },
                { name: 'Risk Prioritization', desc: 'Ranks by member impact, regulatory exposure, urgency' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex-1 flex flex-col justify-center"
                  style={{ background: '#FFFFFF', border: '1px solid var(--color-brand)', borderRadius: '6px', padding: 'min(1.2vh, 10px) min(3%, 14px)' }}
                >
                  <p style={{ fontSize: fs.cardTitle, color: 'var(--color-brand)', fontWeight: 700, margin: '0 0 min(0.4vh, 4px) 0' }}>{item.name}</p>
                  <p style={{ fontSize: fs.cardDesc, color: '#666666', margin: 0, lineHeight: 1.45 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Responsible AI sidebar */}
          <div
            className="flex flex-col"
            style={{ width: 'min(24%, 220px)', flexShrink: 0, background: '#FFFFFF', border: '1.5px solid #00897B', borderRadius: '8px', padding: 'min(1.2vh, 10px) min(1.5%, 14px)' }}
          >
            <p className="flex-shrink-0" style={{ fontSize: fs.label, color: '#00897B', fontWeight: 700, letterSpacing: '1.5px', margin: '0 0 min(1.2vh, 10px) 0' }}>RESPONSIBLE AI</p>
            <div className="flex-1 flex flex-col justify-around">
              {['BSA/AML Compliance Alignment', 'NCUA Exam Readiness Posture', 'Full Signal Audit Trail', 'Explainable Anomaly Reasoning'].map((item) => (
                <p key={item} style={{ fontSize: fs.cardDesc, color: '#333333', fontWeight: 600, margin: 0, lineHeight: 1.35 }}>{item}</p>
              ))}
            </div>
          </div>
        </div>

        <UpArrow />

        {/* Row 2: Agentic Data Platform + Agentic AI */}
        <div
          className="flex flex-col"
          style={{ flex: '2.8 1 0', minHeight: 0, background: 'rgba(0, 48, 135, 0.04)', border: '1.5px solid var(--color-brand)', borderRadius: '8px', padding: 'min(1vh, 8px) min(1.2%, 12px)' }}
        >
          <div className="flex items-baseline flex-shrink-0" style={{ marginBottom: 'min(0.6vh, 6px)', gap: 'min(1vw, 12px)' }}>
            <span style={{ fontSize: fs.label, color: 'var(--color-brand)', fontWeight: 700, letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>AGENTIC DATA PLATFORM + AGENTIC AI</span>
            <span style={{ fontSize: fs.labelSm, color: '#666666', fontWeight: 400 }}>Real-time monitoring agents across all connected systems</span>
          </div>
          <div className="flex flex-1 min-h-0" style={{ gap: 'min(0.5vw, 7px)' }}>
            {clientConfig.monitorAgents.map((agent) => (
              <div
                key={agent.name}
                className="flex-1 flex flex-col justify-center"
                style={{ background: '#FFFFFF', border: '1px solid var(--color-brand)', borderRadius: '6px', padding: 'min(1vh, 8px) min(2.5%, 12px)' }}
              >
                <p style={{ fontSize: fs.cardTitle, color: 'var(--color-brand)', fontWeight: 700, margin: '0 0 min(0.3vh, 3px) 0' }}>{agent.name}</p>
                <p style={{ fontSize: fs.cardDesc, color: '#666666', margin: 0, lineHeight: 1.4 }}>{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <UpArrow />

        {/* Row 3: Client Signal Sources */}
        <div
          className="flex items-center flex-nowrap"
          style={{ flex: '1.2 1 0', minHeight: 0, background: '#F4F5F7', border: '1px solid #E0E0E0', borderRadius: '6px', padding: '0 min(1.5%, 14px)', gap: 'min(1.2vw, 16px)' }}
        >
          <p className="flex-shrink-0" style={{ fontSize: fs.labelSm, color: '#666666', fontWeight: 700, letterSpacing: '1px', margin: 0, whiteSpace: 'nowrap' }}>
            {clientConfig.sourcesLabel}
          </p>
          <div className="flex items-center flex-1 flex-nowrap" style={{ gap: 'min(0.4vw, 5px)', overflow: 'hidden' }}>
            {clientConfig.primarySources.map((src) => (
              <span
                key={src}
                className="flex-shrink-0"
                style={{ background: 'var(--color-brand)', color: '#FFF', fontSize: fs.pill, fontWeight: 600, padding: 'min(0.4vh, 4px) min(0.7vw, 10px)', borderRadius: '4px', whiteSpace: 'nowrap' }}
              >
                {src}
              </span>
            ))}
            {clientConfig.secondarySources.map((src) => (
              <span
                key={src}
                className="flex-shrink-0"
                style={{ background: '#00897B', color: '#FFF', fontSize: fs.pill, fontWeight: 600, padding: 'min(0.4vh, 4px) min(0.7vw, 10px)', borderRadius: '4px', whiteSpace: 'nowrap' }}
              >
                {src}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Gap + Proof ── */}
      <div className="flex-shrink-0" style={{ marginTop: '1vh' }}>
        <div style={{ borderBottom: '1px solid #E0E0E0', marginBottom: '1vh' }} />
        <div className="flex" style={{ gap: 'min(1vw, 10px)' }}>
          <div
            className="flex-1 flex flex-col justify-center"
            style={{ background: '#FFF8E1', border: '1px solid #F59E0B', borderRadius: '6px', padding: 'min(0.8vh, 8px) min(1.5%, 14px)' }}
          >
            <p style={{ fontSize: fs.small, color: '#333333', margin: '0 0 min(0.2vh, 2px) 0', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700 }}>The gap today: </span>
              <span>{clientConfig.gapText}</span>
            </p>
            <p style={{ fontSize: fs.small, color: '#333333', margin: 0, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700 }}>With Anomaly Detection: </span>
              <span>{clientConfig.withText}</span>
            </p>
          </div>

          <div
            className="flex flex-col justify-center"
            style={{ width: 'min(24%, 220px)', flexShrink: 0, background: '#F4F5F7', border: '1px solid #E0E0E0', borderRadius: '6px', padding: 'min(0.8vh, 8px) min(1.5%, 14px)' }}
          >
            <p style={{ fontSize: fs.labelSm, color: '#CC0000', fontWeight: 700, letterSpacing: '1px', margin: '0 0 min(0.3vh, 3px) 0' }}>Developed By</p>
            <p style={{ margin: '0 0 min(0.2vh, 2px) 0' }}>
              <span style={{ fontSize: fs.subtitle, color: 'var(--color-brand)', fontWeight: 800 }}>{clientConfig.deployedAt}</span>
            </p>
            <p style={{ fontSize: fs.small, color: '#666666', fontWeight: 400, margin: 0, lineHeight: 1.35 }}>
              {clientConfig.deployedDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

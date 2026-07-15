import { usePersona } from '../../context/PersonaContext';
import { useBranding } from '../../context/BrandingContext';

export default function PredictiveIntelligenceDiagram() {
  const persona = usePersona();
  const { client } = useBranding();
  const isNFCU = persona.id.startsWith('nfcu_');
  const clientShort = (client?.shortName || 'USSFCU').toUpperCase();

  /* Arrow points UPWARD — matching original SVG: data flows up from sources → foundation → predictive AI */
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

  const clientConfig = isCfo ? {
    bodyText: 'Surfaces what is likely to happen next: when the audit will close, how many staff hours remediation saves, and whether your next NCUA 5300 filing is governed — before the numbers confirm it.',
    predCards: [
      { name: 'Audit Completion Forecast', desc: 'Projects audit close from your audit history — manual reconstruction vs. governed lineage' },
      { name: 'Reconciliation Load', desc: 'Models the monthly staff-hour impact of governing the data flow' },
      { name: '5300 Readiness', desc: 'Projects governed reporting readiness for the next NCUA examination' },
    ],
    signalSubtitle: 'Audit / GRC history extended by the Agentic Data Platform across the core, ledger, GL, and warehouse',
    existingCard: { title: 'Audit / GRC System (USSFCU existing)', desc: 'Audit items, findings, evidence tracking, and remediation status' },
    agenticCardDesc: 'Extends audit history with Jack Henry core, Thought Machine ledger, and Snowflake lineage',
    gapText: 'No native tool projects how long the audit will take or what fixing the data flow would save.',
    withText: 'Projected close, reconciliation-hour savings, and 5300 readiness modeled before you commit budget.',
    sourcesLabel: 'USSFCU DATA SOURCES',
    primarySources: ['Jack Henry Core', 'Thought Machine', 'General Ledger', 'Lending Origination'],
    secondarySources: ['Snowflake', 'Tableau', 'Audit / GRC'],
    deployedAt: 'Verizon',
    deployedDesc: 'Multi-agent orchestration across network ops',
  } : isNFCU ? {
    bodyText: 'Surfaces what is likely to happen next: where staffing gaps will emerge, how quality scores will trend, and which agents are approaching burnout risk — before the numbers confirm it.',
    predCards: [
      { name: 'Staffing Forecasting', desc: 'Projects headcount gaps at 15-minute interval resolution, 6 days out' },
      { name: 'Quality Forecasting', desc: 'Predicts where next compliance or quality score decline will emerge by queue' },
      { name: 'Burnout Risk', desc: 'Flags top-performer fatigue before attrition or quality decline occurs' },
    ],
    signalSubtitle: 'Dynamics 365 WFM (existing) extended by Agentic Data Platform across HR and workforce systems',
    existingCard: { title: 'Dynamics 365 WFM (NFCU existing)', desc: 'Workforce forecasts, scheduling, and adherence tracking in D365' },
    agenticCardDesc: 'Extends D365 signals with Workday, Snowflake, and QA scoring data',
    gapText: 'Dynamics 365 WFM forecasts inside Microsoft stack only. It cannot score burnout risk using QA or HR signals.',
    withText: 'Forward-looking signals span the full workforce ecosystem — staffing, quality, and retention — not just one platform.',
    sourcesLabel: 'NFCU DATA SOURCES',
    primarySources: ['Dynamics 365', 'Quality Mgmt', 'Marketing Cloud', 'Workday'],
    secondarySources: ['Genesys Bridge', 'Snowflake', 'Azure AI', 'ServiceNow'],
    deployedAt: 'Verizon',
    deployedDesc: 'Multi-agent orchestration across network ops',
  } : {
    bodyText: 'Surfaces what is likely to happen next: which members will churn, where the next friction spike will emerge, and which products are underperforming before the numbers confirm it.',
    predCards: [
      { name: 'Churn Forecasting', desc: 'Cross-platform churn risk scoring beyond Einstein alone' },
      { name: 'Friction Forecasting', desc: 'Predicts where next friction spike will emerge by journey' },
      { name: 'Product Performance', desc: 'Flags underperforming loans and products before reports do' },
    ],
    signalSubtitle: 'Einstein AI (existing) extended by Agentic Data Platform across non-Salesforce systems',
    existingCard: { title: `Einstein AI (${clientShort} existing)`, desc: 'Churn scores, lead scoring, next-best-action inside SF' },
    agenticCardDesc: 'Extends Einstein signals with Genesys, Snowflake, Blend data',
    gapText: 'Einstein predicts inside Salesforce only. It cannot score risk using Genesys or Snowflake signals.',
    withText: 'Forward-looking signals span the full ecosystem, not just one platform.',
    sourcesLabel: `${clientShort} DATA SOURCES`,
    primarySources: ['Data Cloud', 'Financial Services Cloud', 'Marketing Cloud', 'Service Cloud'],
    secondarySources: ['Genesys Cloud', 'Snowflake', 'Blend', 'ICE/LOS'],
    deployedAt: 'Verizon',
    deployedDesc: 'Across multiple engagements',
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
          Predictive Intelligence
        </h2>
        <p style={{ fontSize: fs.subtitle, color: '#666666', fontWeight: 500, margin: '0 0 0.3vh 0' }}>
          Powered by Predictive AI + Intelligent CX + KAG
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

        {/* Row 1: Predictive AI + Intelligent CX + Responsible AI */}
        <div className="flex" style={{ flex: '3 1 0', minHeight: 0, gap: 'min(1vw, 10px)' }}>
          <div
            className="flex-1 flex flex-col"
            style={{ background: 'rgba(0, 48, 135, 0.07)', border: '1.5px solid var(--color-brand)', borderRadius: '8px', padding: 'min(1.2vh, 10px) min(1.2%, 12px)' }}
          >
            <div className="flex items-baseline flex-shrink-0" style={{ marginBottom: 'min(0.8vh, 8px)', gap: 'min(1vw, 12px)' }}>
              <span style={{ fontSize: fs.label, color: 'var(--color-brand)', fontWeight: 700, letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>PREDICTIVE AI + INTELLIGENT CX</span>
              <span style={{ fontSize: fs.labelSm, color: '#666666', fontWeight: 400 }}>Forward-looking models across the full platform ecosystem</span>
            </div>
            <div className="flex flex-1 min-h-0" style={{ gap: 'min(0.6vw, 8px)' }}>
              {clientConfig.predCards.map((item) => (
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
              {['Model Explainability', 'Prediction Confidence Scoring', 'Audit Trail for Every Signal', 'NIST AI Risk Framework Alignment'].map((item) => (
                <p key={item} style={{ fontSize: fs.cardDesc, color: '#333333', fontWeight: 600, margin: 0, lineHeight: 1.35 }}>{item}</p>
              ))}
            </div>
          </div>
        </div>

        <UpArrow />

        {/* Row 2: Signal Foundation */}
        <div
          className="flex flex-col"
          style={{ flex: '2.8 1 0', minHeight: 0, background: 'rgba(0, 48, 135, 0.04)', border: '1.5px solid var(--color-brand)', borderRadius: '8px', padding: 'min(1vh, 8px) min(1.2%, 12px)' }}
        >
          <div className="flex items-baseline flex-shrink-0" style={{ marginBottom: 'min(0.6vh, 6px)', gap: 'min(1vw, 12px)' }}>
            <span style={{ fontSize: fs.label, color: 'var(--color-brand)', fontWeight: 700, letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>SIGNAL FOUNDATION</span>
            <span style={{ fontSize: fs.labelSm, color: '#666666', fontWeight: 400 }}>{clientConfig.signalSubtitle}</span>
          </div>
          <div className="flex flex-1 min-h-0" style={{ gap: 'min(0.5vw, 7px)' }}>
            {/* Existing platform card — DASHED border */}
            <div
              className="flex-1 flex flex-col justify-center"
              style={{ background: '#FFFFFF', border: '1px dashed var(--color-brand)', borderRadius: '6px', padding: 'min(1vh, 8px) min(2.5%, 12px)' }}
            >
              <p style={{ fontSize: fs.cardTitle, color: 'var(--color-brand)', fontWeight: 700, margin: '0 0 min(0.3vh, 3px) 0' }}>{clientConfig.existingCard.title}</p>
              <p style={{ fontSize: fs.cardDesc, color: '#666666', margin: 0, lineHeight: 1.4 }}>{clientConfig.existingCard.desc}</p>
            </div>
            {/* Agentic Data Platform card */}
            <div
              className="flex-1 flex flex-col justify-center"
              style={{ background: '#FFFFFF', border: '1px solid var(--color-brand)', borderRadius: '6px', padding: 'min(1vh, 8px) min(2.5%, 12px)' }}
            >
              <p style={{ fontSize: fs.cardTitle, color: 'var(--color-brand)', fontWeight: 700, margin: '0 0 min(0.3vh, 3px) 0' }}>Agentic Data Platform</p>
              <p style={{ fontSize: fs.cardDesc, color: '#666666', margin: 0, lineHeight: 1.4 }}>{clientConfig.agenticCardDesc}</p>
            </div>
            {/* Knowledge-Augmented Generation card */}
            <div
              className="flex-1 flex flex-col justify-center"
              style={{ background: '#FFFFFF', border: '1px solid var(--color-brand)', borderRadius: '6px', padding: 'min(1vh, 8px) min(2.5%, 12px)' }}
            >
              <p style={{ fontSize: fs.cardTitle, color: 'var(--color-brand)', fontWeight: 700, margin: '0 0 min(0.3vh, 3px) 0' }}>Knowledge-Augmented Generation</p>
              <p style={{ fontSize: fs.cardDesc, color: '#666666', margin: 0, lineHeight: 1.4 }}>Grounds predictions in business context and rules</p>
            </div>
          </div>
        </div>

        <UpArrow />

        {/* Row 3: Client Data Sources */}
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
              <span style={{ fontWeight: 700 }}>With Predictive Intelligence: </span>
              <span>{clientConfig.withText}</span>
            </p>
          </div>

          <div
            className="flex flex-col justify-center"
            style={{ width: 'min(24%, 220px)', flexShrink: 0, background: '#F4F5F7', border: '1px solid #E0E0E0', borderRadius: '6px', padding: 'min(0.8vh, 8px) min(1.5%, 14px)' }}
          >
            <p style={{ fontSize: fs.labelSm, color: '#CC0000', fontWeight: 700, letterSpacing: '1px', margin: '0 0 min(0.3vh, 3px) 0' }}>DEPLOYED AT</p>
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

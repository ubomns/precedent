// Screen 2 — BRD Review (`/review`)
// Asymmetric split: 25% sidebar / 75% workspace.

const SECTIONS = [
  { id: 'exec',   n: '01', title: 'Executive Summary' },
  { id: 'obj',    n: '02', title: 'Business Objective' },
  { id: 'scope',  n: '03', title: 'Scope' },
  { id: 'stake',  n: '04', title: 'Stakeholders' },
  { id: 'func',   n: '05', title: 'Functional Requirements' },
  { id: 'nfunc',  n: '06', title: 'Non-Functional Requirements' },
  { id: 'assum',  n: '07', title: 'Assumptions' },
  { id: 'const',  n: '08', title: 'Constraints' },
  { id: 'accept', n: '09', title: 'Acceptance Criteria' },
  { id: 'access', n: '10', title: 'User Access Management' },
  { id: 'sec',    n: '11', title: 'Security Controls' },
  { id: 'ben',    n: '12', title: 'Benefits Realization' },
];

// Per-section drafted content + critic notes. Realistic enough to feel like a real BRD.
const CONTENT = {
  exec: {
    kind: 'prose',
    body: [
      'Meridian will expose its core banking primitives — accounts, payments, and KYC events — through a versioned REST + webhook API for accredited partner fintechs in the EU and UK.',
      'The program targets ten signed partner integrations by Q3 2026, with measurable reductions in partner onboarding time and full alignment with PSD2 SCA, GDPR Art. 32, and FCA PS21/3 obligations.',
    ],
    issues: [{ level: 'low', text: 'Define what "accredited" means in the context of partner eligibility for clarity downstream.' }],
  },
  obj: {
    kind: 'prose',
    body: [
      'Establish Meridian as the preferred banking-as-a-service substrate for compliance-sensitive fintechs in regulated EU/UK markets.',
      'Reduce average partner onboarding from 14 weeks to under 6 weeks while preserving regulator-grade audit posture.',
    ],
    issues: [],
  },
  scope: {
    kind: 'scope',
    inScope: [
      'Account read/write primitives via REST v1',
      'ACH + SEPA payment initiation with idempotency',
      'Webhooks for ledger and lifecycle events',
      'OAuth2 partner onboarding + key rotation',
      'Sandbox environment with synthetic ledger',
    ],
    outScope: [
      'Retail-facing customer UI surfaces',
      'Cross-border FX execution and quoting',
      'Card issuance and BIN sponsorship',
      'Customer support tooling and CRM',
      'Internal employee SSO redesign',
    ],
    issues: [
      { level: 'medium', text: 'Consider clarifying the regulatory boundary for cross-border data — SEPA covers EEA but transit through UK infrastructure has a different posture post-Brexit.' },
      { level: 'low', text: '"Webhooks for ledger and lifecycle events" is loose. Specify event taxonomy or defer to Functional Requirements §5.' },
    ],
  },
  stake: {
    kind: 'people',
    list: [
      { name: 'Priya Anand',   role: 'Head of Compliance',  signoff: 'required' },
      { name: 'Marcus Wei',    role: 'Platform Lead',       signoff: 'required' },
      { name: 'Sofia Reyes',   role: 'Partner Success',     signoff: 'consulted' },
      { name: 'Jens Hartmann', role: 'Security Architect',  signoff: 'required' },
      { name: 'Lin Chen',      role: 'Legal — Data',        signoff: 'consulted' },
    ],
    issues: [{ level: 'low', text: 'No representative from Treasury is listed — payment liquidity decisions may require their input.' }],
  },
  func: {
    kind: 'list',
    label: 'Requirements',
    items: [
      { id: 'FR-01', text: 'System shall support OAuth2 client_credentials and authorization_code flows for partner onboarding.' },
      { id: 'FR-02', text: 'Each account resource shall expose balance, currency, and ledger position with sub-200ms p95 read latency.' },
      { id: 'FR-03', text: 'Payment initiation shall be idempotent on a client-supplied key with a 24-hour retention window.' },
      { id: 'FR-04', text: 'Webhook deliveries shall be retried with exponential backoff up to 24 hours.' },
    ],
    issues: [],
  },
  nfunc: {
    kind: 'list',
    label: 'NFRs',
    items: [
      { id: 'NFR-01', text: 'p99 read latency < 350ms measured at the API gateway.' },
      { id: 'NFR-02', text: 'Availability ≥ 99.95% per calendar month, excluding scheduled maintenance windows.' },
      { id: 'NFR-03', text: 'All PII at rest encrypted with AES-256; keys rotated quarterly via HSM.' },
    ],
    issues: [{ level: 'medium', text: 'No requirement for partner-facing status page or incident notification SLA.' }],
  },
  assum:  { kind: 'prose', body: ['Partner volume will not exceed 50 RPS aggregate in year one.', 'KYC verification will continue to be performed by an upstream vendor; this BRD does not redesign that flow.'], issues: [] },
  const:  { kind: 'prose', body: ['Cannot adopt vendor solutions not previously approved by the bank\'s Architecture Review Board.', 'PSD2 SCA cannot be bypassed even for high-trust partners.'], issues: [{ level: 'low', text: 'List doesn\'t address constraints from internal data residency policy.' }] },
  accept: { kind: 'list', label: 'Criteria', items: [
    { id: 'AC-01', text: 'Ten accredited partners successfully onboarded against the sandbox before production cutover.' },
    { id: 'AC-02', text: 'Full penetration test passed with no Critical or High findings unresolved at go-live.' },
    { id: 'AC-03', text: 'External audit confirms PSD2 SCA conformance for all payment paths.' },
  ], issues: [] },
  access: { kind: 'prose', body: ['Access to production API credentials shall require manager + security approval through the internal access broker.', 'All partner API keys shall be tied to a designated technical contact who must re-attest quarterly.'], issues: [{ level: 'medium', text: 'No documented offboarding path when a partner\'s technical contact leaves the organization.' }] },
  sec:    { kind: 'list', label: 'Controls', items: [
    { id: 'SEC-01', text: 'Mutual TLS required for all partner-to-Meridian traffic in production.' },
    { id: 'SEC-02', text: 'Logging shall include immutable per-request audit records retained for seven years.' },
    { id: 'SEC-03', text: 'Secrets management via HSM-backed vault; no static secrets in deployment artifacts.' },
  ], issues: [] },
  ben:    { kind: 'prose', body: ['Onboarding time reduced from 14 weeks to under 6 weeks (target Q3 2026).', '€4.2M projected incremental revenue from partner-driven fee income in year one.', 'Reduced compliance overhead per partner via automated attestation workflow.'], issues: [] },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
function Sidebar({ project, activeId, onSelect, reviewed, total, navigate }) {
  return (
    <aside className="w-[260px] shrink-0 flex flex-col gap-6 py-6 pl-6 pr-2">
      {/* Top: wordmark + project */}
      <div className="flex flex-col gap-5">
        <button
          onClick={() => navigate?.('Intake')}
          className="flex items-center gap-2 group w-max"
          title="Back to Intake"
        >
          <span className="relative w-2 h-2 rounded-full bg-emerald-500 status-dot"/>
          <span className="text-[13px] font-medium tracking-tight text-ink group-hover:text-emerald-400 transition-colors">Precedent</span>
        </button>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-medium">Project</span>
          <span className="text-[14px] font-medium text-ink tracking-tight leading-snug">{project}</span>
          <span className="text-[11px] font-mono text-zinc-500 mt-0.5">brd-2026-0418</span>
        </div>
      </div>

      <div className="border-t hairline"/>

      {/* Section list */}
      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto -mr-2 pr-2">
        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-medium px-2 pb-1">BRD Sections</div>
        {SECTIONS.map((s) => {
          const isActive = s.id === activeId;
          const sectionContent = CONTENT[s.id];
          const issueCount = sectionContent?.issues?.length || 0;
          const hasIssues = issueCount > 0;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={[
                'group relative flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors',
                isActive ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]',
              ].join(' ')}
            >
              <span className="w-4 flex justify-center">
                {isActive
                  ? <span className="nav-dot"/>
                  : <span className="text-[10px] font-mono text-zinc-600 tabular-nums">{s.n}</span>
                }
              </span>
              <span className={`text-[13px] tracking-tight flex-1 leading-tight ${isActive ? 'text-emerald-400 font-medium' : 'text-zinc-300 group-hover:text-ink'}`}>
                {s.title}
              </span>
              {hasIssues ? (
                <span className={`w-1.5 h-1.5 rounded-full ${issueCount >= 2 ? 'bg-amber-400' : 'bg-amber-400/50'}`}/>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Progress + CTA */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-medium">Reviewed</span>
            <span className="text-[11px] font-mono text-zinc-400 tabular-nums">{reviewed} / {total}</span>
          </div>
          <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${(reviewed/total)*100}%`, boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}
            />
          </div>
        </div>

        <PillCTA fullWidth size="sm" trailingIcon={<IconDownload size={13}/>}>
          Export to Word
        </PillCTA>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section content renderer (varies by kind)
function SectionBody({ section, content }) {
  if (content.kind === 'scope') {
    return (
      <div className="grid grid-cols-2 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-mono">In Scope</span>
            <span className="text-[10px] font-mono text-zinc-600">— {content.inScope.length}</span>
          </div>
          <ul className="flex flex-col gap-3">
            {content.inScope.map((it, i) => (
              <li key={i} className="flex gap-3 text-[14px] text-zinc-300 leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"/>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">Out of Scope</span>
            <span className="text-[10px] font-mono text-zinc-700">— {content.outScope.length}</span>
          </div>
          <ul className="flex flex-col gap-3">
            {content.outScope.map((it, i) => (
              <li key={i} className="flex gap-3 text-[14px] text-zinc-500 leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0"/>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (content.kind === 'list') {
    return (
      <ul className="flex flex-col">
        {content.items.map((it, i) => (
          <li key={it.id} className={`flex gap-5 py-3.5 ${i !== 0 ? 'border-t hairline' : ''}`}>
            <span className="text-[11px] font-mono text-emerald-400/80 tracking-tight mt-1 w-14 shrink-0">{it.id}</span>
            <span className="text-[14px] text-zinc-300 leading-relaxed">{it.text}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (content.kind === 'people') {
    return (
      <ul className="flex flex-col">
        {content.list.map((p, i) => (
          <li key={i} className={`grid grid-cols-[1fr_auto] gap-6 items-center py-3.5 ${i !== 0 ? 'border-t hairline' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/[0.05] ring-1 ring-white/10 flex items-center justify-center text-[11px] font-medium text-ink">
                {p.name.split(' ').map((x) => x[0]).join('')}
              </span>
              <div className="flex flex-col">
                <span className="text-[14px] text-ink tracking-tight">{p.name}</span>
                <span className="text-[12px] text-zinc-500">{p.role}</span>
              </div>
            </div>
            <span className={`text-[10px] uppercase tracking-[0.16em] font-mono ${p.signoff === 'required' ? 'text-emerald-400' : 'text-zinc-500'}`}>
              {p.signoff}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  // prose
  return (
    <div className="flex flex-col gap-4">
      {content.body.map((para, i) => (
        <p key={i} className="text-[14.5px] text-zinc-300 leading-[1.7] max-w-[68ch]">{para}</p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Critic feedback card
function CriticCard({ issues }) {
  const [addressed, setAddressed] = React.useState({});
  const [showLow, setShowLow] = React.useState(false);

  const highMed = issues.filter((x) => x.level !== 'low');
  const low = issues.filter((x) => x.level === 'low');

  if (!issues.length) {
    return (
      <DoubleBezel padding="p-7" outerTone="subtle">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center text-emerald-400">
            <IconCheck size={15}/>
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] text-ink font-medium tracking-tight">Critic review clean</span>
            <span className="text-[12px] text-zinc-500">No issues flagged in this section.</span>
          </div>
        </div>
      </DoubleBezel>
    );
  }

  return (
    <DoubleBezel padding="p-7" outerTone="subtle">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-white/[0.05] ring-1 ring-white/10 flex items-center justify-center text-emerald-400/90">
            <IconShield size={13}/>
          </span>
          <span className="text-[13px] font-medium tracking-tight text-ink">Critic Review</span>
          <span className="text-[11px] font-mono text-zinc-500 ml-1">agent-02</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] font-mono text-zinc-500">
          {issues.length} {issues.length === 1 ? 'note' : 'notes'}
        </span>
      </div>

      <ul className="flex flex-col">
        {highMed.map((it, i) => {
          const key = `${it.level}-${i}`;
          const done = addressed[key];
          return (
            <li key={key} className={`flex gap-4 py-4 ${i !== 0 ? 'border-t hairline' : 'border-t hairline'}`}>
              <SeverityBadge level={it.level}/>
              <div className="flex-1 flex flex-col gap-2.5">
                <p className={`text-[13.5px] leading-relaxed ${done ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>{it.text}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddressed((a) => ({ ...a, [key]: !a[key] }))}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] tracking-tight transition-colors ${done ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-white/[0.04] text-zinc-400 ring-1 ring-white/10 hover:text-ink hover:bg-white/[0.08]'}`}
                  >
                    {done ? <><IconCheck size={11}/> addressed</> : 'mark as addressed'}
                  </button>
                  <button className="text-[11px] text-zinc-500 hover:text-zinc-300 px-2 py-1 transition-colors">
                    view in source
                  </button>
                </div>
              </div>
            </li>
          );
        })}

        {low.length > 0 && !showLow && (
          <li className="border-t hairline pt-4 mt-1">
            <button
              onClick={() => setShowLow(true)}
              className="text-[12px] text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1.5 transition-colors font-mono tracking-tight"
            >
              <IconChevronDown size={11}/>
              Show {low.length} low-severity {low.length === 1 ? 'note' : 'notes'}
            </button>
          </li>
        )}

        {low.length > 0 && showLow && low.map((it, i) => {
          const key = `low-x-${i}`;
          const done = addressed[key];
          return (
            <li key={key} className="flex gap-4 py-4 border-t hairline">
              <SeverityBadge level="low"/>
              <div className="flex-1 flex flex-col gap-2.5">
                <p className={`text-[13.5px] leading-relaxed ${done ? 'text-zinc-600 line-through' : 'text-zinc-400'}`}>{it.text}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddressed((a) => ({ ...a, [key]: !a[key] }))}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] tracking-tight transition-colors ${done ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-white/[0.04] text-zinc-400 ring-1 ring-white/10 hover:text-ink hover:bg-white/[0.08]'}`}
                  >
                    {done ? <><IconCheck size={11}/> addressed</> : 'mark as addressed'}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </DoubleBezel>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ReviewScreen({ project, navigate }) {
  const [activeId, setActiveId] = React.useState('scope');
  const section = SECTIONS.find((s) => s.id === activeId);
  const content = CONTENT[activeId];

  const issues = content.issues;
  const issueSummary = (() => {
    if (!issues.length) return null;
    const counts = issues.reduce((acc, it) => ((acc[it.level] = (acc[it.level] || 0) + 1), acc), {});
    const parts = ['high','medium','low'].filter((k) => counts[k]).map((k) => `${counts[k]} ${k}`);
    return `${issues.length} ${issues.length === 1 ? 'issue' : 'issues'} found (${parts.join(', ')})`;
  })();

  return (
    <div className="min-h-screen flex" data-screen-label="02 Review">
      <Sidebar
        project={project}
        activeId={activeId}
        onSelect={setActiveId}
        reviewed={8}
        total={12}
        navigate={navigate}
      />

      {/* Workspace */}
      <div className="flex-1 py-6 pr-6 pl-4 min-h-screen">
        <div className="relative bg-surface ring-1 ring-white/10 rounded-card min-h-full overflow-hidden">
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 rounded-card pointer-events-none" style={{boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)'}}/>

          {/* Section workspace inner padding */}
          <div className="relative p-10 pb-32 flex flex-col gap-7">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 tracking-tight">
              <span>BRD</span>
              <IconChevron size={10}/>
              <span>{project}</span>
              <IconChevron size={10}/>
              <span className="text-zinc-300">§ {section.n} {section.title}</span>
            </div>

            {/* Header */}
            <div className="flex items-end justify-between gap-6">
              <div className="flex items-baseline gap-4 flex-wrap">
                <h1 className="text-[34px] tracking-[-0.025em] text-ink font-medium leading-none">{section.title}</h1>
                {issueSummary
                  ? <SeverityBadge level={issues.some((i)=>i.level==='medium') ? 'medium' : 'low'}>{issueSummary}</SeverityBadge>
                  : <SeverityBadge level="low"><span className="text-zinc-400">no issues</span></SeverityBadge>
                }
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 shrink-0">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 status-dot"/>
                  drafter complete
                </span>
                <span className="mx-2 text-zinc-700">·</span>
                <span>updated 2m ago</span>
              </div>
            </div>

            {/* Drafted content card */}
            <DoubleBezel padding="p-10">
              <div className="flex items-center justify-between mb-7">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-white/[0.05] ring-1 ring-white/10 flex items-center justify-center text-zinc-400">
                    <IconDoc size={13}/>
                  </span>
                  <span className="text-[13px] font-medium tracking-tight text-ink">Drafted Content</span>
                  <span className="text-[11px] font-mono text-zinc-500 ml-1">agent-01</span>
                </div>
                <button className="text-[11px] text-zinc-500 hover:text-ink transition-colors font-mono tracking-tight inline-flex items-center gap-1.5">
                  <IconSparkle size={11}/>
                  regenerate
                </button>
              </div>

              <SectionBody section={section} content={content}/>
            </DoubleBezel>

            {/* Critic feedback card */}
            <CriticCard issues={issues}/>

          </div>
        </div>
      </div>

      {/* Floating export — bottom right */}
      <button
        className="cta fixed bottom-8 right-8 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center"
        style={{ boxShadow: '0 20px 40px -15px rgba(16,185,129,0.35), 0 1px 0 rgba(255,255,255,0.15) inset' }}
        title="Export BRD to Word"
      >
        <span className="cta-icon"><IconDownload size={18}/></span>
      </button>
    </div>
  );
}

window.ReviewScreen = ReviewScreen;

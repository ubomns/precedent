// Screen 1 — Brief Intake (`/`)
// Mini-minimalist hero + centered double-bezel form.

const DEFAULT_STAKEHOLDERS = [
  { name: 'Priya Anand',  role: 'Head of Compliance' },
  { name: 'Marcus Wei',    role: 'Platform Lead' },
  { name: '',              role: '' },
];

const DEFAULT_INTAKE = {
  objective: 'Expose Meridian core banking primitives (accounts, payments, KYC events) through a versioned REST + webhook API for accredited partner fintechs operating in EU and UK markets.',
  stakeholders: DEFAULT_STAKEHOLDERS,
  scopeIn: '• Account read/write\n• ACH + SEPA payment initiation\n• Webhooks for ledger events\n• OAuth2 partner onboarding',
  scopeOut: '• Retail-facing UI\n• Cross-border FX execution\n• Card issuance\n• Customer support tooling',
  users: 'Engineering teams at tier-2 EU/UK fintech partners',
  regulatory: 'PSD2 SCA, GDPR Art. 32, FCA Operational Resilience (PS21/3), and internal MNPI handling policy.',
};

function IntakeScreen({ onGenerate, navigate, accent }) {
  const [data, setData] = React.useState(DEFAULT_INTAKE);
  const [submitting, setSubmitting] = React.useState(false);
  const set = (k) => (v) => setData((d) => ({ ...d, [k]: v }));

  const setStakeholder = (i, key, v) => {
    setData((d) => {
      const next = d.stakeholders.slice();
      next[i] = { ...next[i], [key]: v };
      return { ...d, stakeholders: next };
    });
  };
  const addStakeholder = () => setData((d) => ({ ...d, stakeholders: [...d.stakeholders, { name: '', role: '' }] }));
  const removeStakeholder = (i) => setData((d) => {
    if (d.stakeholders.length <= 1) return d;
    const next = d.stakeholders.slice();
    next.splice(i, 1);
    return { ...d, stakeholders: next };
  });

  const handleGenerate = () => {
    if (submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onGenerate?.(data);
    }, 1100);
  };

  return (
    <div className="relative min-h-screen flex flex-col" data-screen-label="01 Intake">
      {/* Ambient vignette */}
      <div className="vignette absolute inset-0"/>

      {/* Top nav */}
      <header className="relative z-10">
        <GlassNav active="Intake" onNavigate={navigate} canReview={true}/>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-6 pt-16 pb-24">
        {/* Hero — restrained */}
        <div className="flex flex-col items-center text-center max-w-[640px] mb-10">
          <Eyebrow>Business Requirements Document Generator</Eyebrow>
          <h1 className="mt-6 text-4xl md:text-5xl tracking-[-0.025em] text-ink font-medium leading-[1.05]">
            From brief to BRD.
          </h1>
          <p className="mt-4 text-[17px] text-zinc-400 max-w-[55ch] leading-relaxed">
            Enter what only you know. We&rsquo;ll handle the structure.
          </p>
        </div>

        {/* The form card */}
        <DoubleBezel
          className="w-full max-w-[640px]"
          padding="p-8 md:p-10"
        >
          <div className="flex flex-col gap-7">

            {/* Project Objective */}
            <div>
              <FieldLabel htmlFor="objective" hint="01 · context">Project Objective</FieldLabel>
              <TextArea
                id="objective"
                rows={4}
                value={data.objective}
                onChange={set('objective')}
                placeholder="What is being built, for whom, and why now?"
              />
            </div>

            {/* Stakeholders */}
            <div>
              <FieldLabel hint={`02 · ${data.stakeholders.length} people`}>Stakeholders</FieldLabel>
              <div className="flex flex-col gap-2">
                {data.stakeholders.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input
                      value={s.name}
                      onChange={(e) => setStakeholder(i, 'name', e.target.value)}
                      placeholder="Name"
                      className="field bg-surface-2 border border-white/10 rounded-2xl px-4 py-2.5 text-[13.5px] text-ink placeholder:text-zinc-600"
                    />
                    <input
                      value={s.role}
                      onChange={(e) => setStakeholder(i, 'role', e.target.value)}
                      placeholder="Role"
                      className="field bg-surface-2 border border-white/10 rounded-2xl px-4 py-2.5 text-[13.5px] text-ink placeholder:text-zinc-600"
                    />
                    <button
                      onClick={() => removeStakeholder(i)}
                      className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.02] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                      aria-label="Remove stakeholder"
                    >
                      <IconX size={13}/>
                    </button>
                  </div>
                ))}

                <button
                  onClick={addStakeholder}
                  className="self-start mt-1 inline-flex items-center gap-2 text-[12px] text-zinc-400 hover:text-emerald-400 transition-colors font-mono tracking-tight"
                >
                  <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
                    <IconPlus size={11}/>
                  </span>
                  add stakeholder
                </button>
              </div>
            </div>

            {/* Scope (side-by-side inside the card) */}
            <div>
              <FieldLabel hint="03 · boundaries">Scope</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-emerald-400/80 mb-1.5 tracking-wider">IN</span>
                  <TextArea
                    rows={5}
                    value={data.scopeIn}
                    onChange={set('scopeIn')}
                    placeholder="• What's in"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-zinc-500 mb-1.5 tracking-wider">OUT</span>
                  <TextArea
                    rows={5}
                    value={data.scopeOut}
                    onChange={set('scopeOut')}
                    placeholder="• What's out"
                  />
                </div>
              </div>
            </div>

            {/* Target Users */}
            <div>
              <FieldLabel htmlFor="users" hint="04 · audience">Target Users</FieldLabel>
              <TextField
                id="users"
                value={data.users}
                onChange={set('users')}
                placeholder="Who will use what's built?"
              />
            </div>

            {/* Regulatory Context */}
            <div>
              <FieldLabel htmlFor="reg" hint="05 · constraints">Regulatory Context</FieldLabel>
              <TextArea
                id="reg"
                rows={3}
                value={data.regulatory}
                onChange={set('regulatory')}
                placeholder="Standards, jurisdictions, internal policies"
              />
            </div>

            {/* Generate CTA — flush full width inside the inner core */}
            <div className="pt-2">
              <PillCTA
                fullWidth
                onClick={handleGenerate}
                loading={submitting}
                trailingIcon={submitting ? null : <IconArrow size={14}/>}
              >
                {submitting ? 'Drafting your BRD…' : 'Generate BRD'}
              </PillCTA>
              <p className="mt-3 text-center text-[11px] text-zinc-600 font-mono tracking-tight">
                Drafter agent &nbsp;·&nbsp; Critic agent &nbsp;·&nbsp; ~ 30 seconds
              </p>
            </div>
          </div>
        </DoubleBezel>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-6 pt-2 flex justify-between items-center px-8 text-[12px] text-zinc-600 font-mono tracking-tight">
        <span>Precedent v1 · 2026</span>
        <span className="inline-flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-emerald-500 status-dot"/>
          agents ready
        </span>
      </footer>
    </div>
  );
}

window.IntakeScreen = IntakeScreen;

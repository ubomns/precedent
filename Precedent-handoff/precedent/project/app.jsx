// Precedent — main orchestrator
// Screen state + Tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "screen": "intake",
  "accent": "emerald",
  "vignette": 0.6,
  "showLegalSeal": false
}/*EDITMODE-END*/;

// Accent palette swatches (curated — no purple/blue per anti-patterns).
// Each is a desaturated, professional hue.
const ACCENTS = {
  emerald: { hex: '#10B981', name: 'Emerald' },
  sage:    { hex: '#7AA381', name: 'Sage' },
  amber:   { hex: '#D6A55C', name: 'Amber' },
  rust:    { hex: '#C97052', name: 'Rust' },
};

function applyAccent(accent) {
  const hex = ACCENTS[accent]?.hex || ACCENTS.emerald.hex;
  // Convert hex to rgb for use in rgba()
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  document.documentElement.style.setProperty('--accent', hex);
  document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = React.useState(t.screen || 'intake');
  const [project, setProject] = React.useState('Meridian Banking API');

  React.useEffect(() => {
    applyAccent(t.accent);
    // Vignette intensity → CSS var
    document.documentElement.style.setProperty('--vignette', String(t.vignette));
  }, [t.accent, t.vignette]);

  // Keep tweak state in sync with internal screen state for convenience
  const navigate = (to) => {
    const key = to.toLowerCase();
    if (key === 'export') return; // no-op for now
    setScreen(key);
    setTweak('screen', key);
  };

  const onGenerate = (data) => {
    // Pretend we used the form data; just transition.
    setScreen('review');
    setTweak('screen', 'review');
  };

  return (
    <div className="min-h-screen">
      {/* Vignette overlay multiplier (controlled via CSS var) */}
      <style>{`
        .vignette { opacity: var(--vignette, 0.6); }
      `}</style>

      <div key={screen} className="screen-enter">
        {screen === 'intake'
          ? <IntakeScreen onGenerate={onGenerate} navigate={navigate} accent={t.accent}/>
          : <ReviewScreen project={project} navigate={navigate}/>
        }
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Flow"/>
        <TweakRadio
          label="Screen"
          value={screen}
          options={['intake','review']}
          onChange={(v) => { setScreen(v); setTweak('screen', v); }}
        />

        <TweakSection label="Palette"/>
        <TweakColor
          label="Accent"
          value={ACCENTS[t.accent]?.hex || ACCENTS.emerald.hex}
          options={Object.values(ACCENTS).map((a) => a.hex)}
          onChange={(hex) => {
            const key = Object.keys(ACCENTS).find((k) => ACCENTS[k].hex === hex) || 'emerald';
            setTweak('accent', key);
          }}
        />

        <TweakSection label="Mood"/>
        <TweakSlider
          label="Vignette"
          value={t.vignette}
          min={0} max={1} step={0.05}
          onChange={(v) => setTweak('vignette', v)}
        />

        <TweakSection label="Project"/>
        <TweakText
          label="Project name"
          value={project}
          onChange={setProject}
        />
      </TweaksPanel>
    </div>
  );
}

// Replace tailwind emerald-* with our accent var where it matters most.
// We do this with a small style injection so the brand accent is theme-able.
(function bindAccent() {
  const css = `
    .bg-emerald-600, .hover\\:bg-emerald-600:hover { background-color: var(--accent, #10B981) !important; }
    .bg-emerald-500, .hover\\:bg-emerald-500:hover { background-color: color-mix(in oklab, var(--accent, #10B981), white 8%) !important; }
    .text-emerald-400 { color: color-mix(in oklab, var(--accent, #10B981), white 20%) !important; }
    .text-emerald-400\\/80 { color: color-mix(in oklab, var(--accent, #10B981), white 20%) !important; opacity: .8; }
    .text-emerald-400\\/90 { color: color-mix(in oklab, var(--accent, #10B981), white 20%) !important; opacity: .9; }
    .bg-emerald-500\\/10  { background-color: rgba(var(--accent-rgb, 16 185 129), 0.10) !important; }
    .bg-emerald-500\\/20  { background-color: rgba(var(--accent-rgb, 16 185 129), 0.20) !important; }
    .ring-emerald-500\\/20 { --tw-ring-color: rgba(var(--accent-rgb, 16 185 129), 0.20) !important; }
    .ring-emerald-500\\/50 { --tw-ring-color: rgba(var(--accent-rgb, 16 185 129), 0.50) !important; }
    .bg-emerald-500 { background-color: var(--accent, #10B981) !important; }
  `;
  const s = document.createElement('style');
  s.id = 'accent-binding';
  s.textContent = css;
  document.head.appendChild(s);
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

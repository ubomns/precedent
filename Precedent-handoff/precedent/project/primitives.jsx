// Shared primitives for Precedent.
// Double-bezel cards, pill CTAs, fields, badges, chrome.

// ─────────────────────────────────────────────────────────────────────────────
// DoubleBezel — the mandatory shell. Outer aluminum tray + inner glass plate.
const DoubleBezel = ({
  className = '',
  innerClassName = '',
  padding = 'p-10',
  innerStyle,
  style,
  children,
  outerTone = 'default', // 'default' | 'subtle'
  asMotion = false,
  ...rest
}) => {
  const outerBg = outerTone === 'subtle' ? 'bg-white/[0.03]' : 'bg-white/[0.05]';
  return (
    <div
      className={`relative ${outerBg} ring-1 ring-white/10 p-1.5 rounded-card bezel-lift ${className}`}
      style={style}
      {...rest}
    >
      <div
        className={`bg-surface bezel-inner-shadow rounded-card-inner ${padding} ${innerClassName}`}
        style={innerStyle}
      >
        {children}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PillCTA — primary action. Trailing nested icon (mandatory, per spec).
const PillCTA = ({
  children,
  trailingIcon = null,
  fullWidth = false,
  onClick,
  variant = 'primary', // 'primary' | 'ghost'
  size = 'md', // 'sm' | 'md'
  className = '',
  loading = false,
  ...rest
}) => {
  const base = 'cta group relative inline-flex items-center justify-center font-medium tracking-tight rounded-full select-none';
  const sizing = size === 'sm'
    ? 'pl-4 pr-1.5 py-1.5 text-[13px] gap-3'
    : 'pl-6 pr-1.5 py-1.5 text-sm gap-4';
  const palette = variant === 'primary'
    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
    : 'bg-white/[0.06] text-ink hover:bg-white/[0.10] ring-1 ring-white/10';
  const iconWell = variant === 'primary' ? 'bg-white/15' : 'bg-white/10';

  const iconSize = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const heightPad = size === 'sm' ? 'py-1.5' : 'py-2';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${sizing} ${heightPad} ${palette} ${fullWidth ? 'w-full justify-between' : ''} ${className}`}
      {...rest}
    >
      <span className="pl-0.5">{children}</span>
      <span className={`cta-icon ${iconSize} rounded-full ${iconWell} flex items-center justify-center`}>
        {loading
          ? <span className="block w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin"/>
          : (trailingIcon || <IconArrowDiag size={14} />)
        }
      </span>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FieldLabel — small caps label that sits above the field.
const FieldLabel = ({ children, hint, htmlFor }) => (
  <div className="flex items-baseline justify-between mb-2">
    <label htmlFor={htmlFor} className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 font-medium">
      {children}
    </label>
    {hint ? <span className="text-[10px] text-zinc-600 font-mono">{hint}</span> : null}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TextField — single-line input
const TextField = ({ id, value, onChange, placeholder, leadingIcon, className = '' }) => (
  <div className={`relative ${className}`}>
    {leadingIcon ? (
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">{leadingIcon}</span>
    ) : null}
    <input
      id={id}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`field w-full bg-surface-2 border border-white/10 rounded-2xl ${leadingIcon ? 'pl-11' : 'pl-4'} pr-4 py-3 text-[14px] text-ink placeholder:text-zinc-600`}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TextArea — multi-line input
const TextArea = ({ id, value, onChange, placeholder, rows = 4, className = '' }) => (
  <textarea
    id={id}
    rows={rows}
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    placeholder={placeholder}
    className={`field w-full bg-surface-2 border border-white/10 rounded-2xl px-4 py-3 text-[14px] text-ink placeholder:text-zinc-600 leading-relaxed ${className}`}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// SeverityBadge — pill-shaped, all-cap.
const SeverityBadge = ({ level = 'low', className = '', children }) => {
  const map = {
    high:   'bg-rose-500/10  text-rose-400  border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low:    'bg-zinc-500/10  text-zinc-400  border-zinc-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 border text-[10px] font-medium uppercase tracking-[0.14em] ${map[level]} ${className}`}>
      <span className={`w-1 h-1 rounded-full ${level === 'high' ? 'bg-rose-400' : level === 'medium' ? 'bg-amber-400' : 'bg-zinc-400'}`}/>
      {children || level}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Eyebrow — small caps tag.
const Eyebrow = ({ children, className = '' }) => (
  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500 ring-1 ring-white/10 bg-white/[0.025] ${className}`}>
    <span className="w-1 h-1 rounded-full bg-emerald-500/80 status-dot"/>
    {children}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// GlassNav — floating pill navbar
const GlassNav = ({ active = 'Intake', onNavigate, canReview = false }) => {
  const items = ['Intake', 'Review', 'Export'];
  return (
    <nav className="mt-6 mx-auto w-max rounded-full backdrop-blur-2xl bg-white/[0.04] border border-white/10 px-2 py-1.5 flex items-center gap-1 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2 pl-3 pr-4 py-1.5 border-r border-white/10 mr-1">
        <span className="relative inline-flex">
          <span className="w-2 h-2 rounded-full bg-emerald-500 status-dot"/>
        </span>
        <span className="text-[13px] font-medium tracking-tight text-ink">Precedent</span>
      </div>
      {items.map((it) => {
        const isActive = it === active;
        const isReview = it === 'Review';
        const disabled = isReview && !canReview;
        return (
          <button
            key={it}
            onClick={() => !disabled && onNavigate?.(it)}
            disabled={disabled}
            className={[
              'px-3.5 py-1.5 rounded-full text-[13px] tracking-tight transition-colors',
              isActive ? 'bg-white/[0.08] text-ink' : 'text-zinc-400 hover:text-ink',
              disabled ? 'opacity-40 cursor-not-allowed hover:text-zinc-400' : '',
            ].join(' ')}
          >
            {it}
          </button>
        );
      })}
    </nav>
  );
};

Object.assign(window, {
  DoubleBezel, PillCTA, FieldLabel, TextField, TextArea,
  SeverityBadge, Eyebrow, GlassNav,
});

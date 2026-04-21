
/* ─── NutriSea Official Logo Mark ─── */
export const NutriSeaLogoImg = ({ size = 48, className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`} style={{ width: 'auto' }}>
    <div style={{ width: size, height: size }} className="rounded-xl bg-gradient-to-br from-sky-600 to-cyan-400 flex items-center justify-center shadow-sm shrink-0">
      <span className="text-white font-black" style={{ fontSize: size * 0.4 }}>N</span>
    </div>
    <div className="leading-none">
      <p className="font-black text-sky-700 tracking-tight" style={{ fontSize: size * 0.35 }}>NutriSea</p>
      <p className="font-bold text-slate-400 uppercase tracking-widest" style={{ fontSize: size * 0.2 }}>Gizi Anak</p>
    </div>
  </div>
);

export const PillShape = ({ color = '#0284c7', className = '' }) => (
  <svg width="36" height="18" viewBox="0 0 36 18" fill="none" className={className}>
    <rect x="0" y="0" width="36" height="18" rx="9" fill={color} opacity="0.15" />
    <rect x="0" y="0" width="18" height="18" rx="9" fill={color} opacity="0.25" />
    <line x1="18" y1="2" x2="18" y2="16" stroke={color} strokeWidth="1" opacity="0.4" />
  </svg>
);

/* ─── Floating pills decoration for auth screens ─── */
export const FloatingPills = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-[8%] left-[12%] rotate-[25deg] opacity-30">
      <PillShape color="#EDD9F5" />
    </div>
    <div className="absolute top-[18%] right-[8%] rotate-[-15deg] opacity-25">
      <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
        <rect width="28" height="14" rx="7" fill="#EDD9F5" />
        <rect width="14" height="14" rx="7" fill="#D4A8E0" />
      </svg>
    </div>
    <div className="absolute top-[35%] left-[5%] rotate-[45deg] opacity-20">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="10" fill="#EDD9F5" />
        <circle cx="11" cy="11" r="5" fill="#D4A8E0" />
      </svg>
    </div>
    <div className="absolute bottom-[25%] right-[5%] rotate-[60deg] opacity-25">
      <PillShape color="#EDD9F5" />
    </div>
    <div className="absolute bottom-[12%] left-[18%] rotate-[-30deg] opacity-20">
      <svg width="30" height="15" viewBox="0 0 30 15" fill="none">
        <rect width="30" height="15" rx="7.5" fill="#EDD9F5" />
        <rect x="15" width="15" height="15" rx="7.5" fill="#D4A8E0" />
      </svg>
    </div>
  </div>
);

/* ─── Circular Progress Ring ─── */
export const CircularProgress = ({ percentage, size = 100, strokeWidth = 8, color = '#8B2C8C' }) => {
  const r = (size - strokeWidth) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (Math.min(percentage, 100) / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EDD9F5" strokeWidth={strokeWidth} fill="transparent" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="font-black text-lg" style={{ color }}>{percentage}%</span>
      </div>
    </div>
  );
};

/* ─── Primary Button ─── */
export const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const base = 'w-full py-3.5 rounded-full font-bold transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed select-none';
  const variants = {
    primary: 'bg-sky-600 text-white shadow-nutrisea hover:bg-sky-700',
    secondary: 'bg-sky-100 text-sky-600 hover:bg-sky-200',
    outline: 'border-2 border-sky-600 text-sky-600 hover:bg-sky-50',
    ghost: 'text-sky-600 hover:bg-sky-50',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    white: 'bg-white text-sky-600 shadow-card hover:bg-sky-50',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const InputField = ({ icon: Icon, type = 'text', placeholder, rightIcon, value, onChange, name, ...props }) => (
  <div className="bg-white border-2 border-sky-100 rounded-2xl px-4 py-3 w-full flex items-center gap-3 focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-600/15 transition-all shadow-sm">
    {Icon && <Icon size={18} className="text-sky-400 shrink-0" />}
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} name={name}
      className="bg-transparent flex-1 outline-none text-slate-800 placeholder:text-slate-400 font-semibold text-sm" {...props} />
    {rightIcon}
  </div>
);

export const Header = ({ title, showBack, onBack, rightElement }) => (
  <div className="flex items-center justify-between py-4 px-5 sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-sky-100">
    <div className="flex items-center gap-3">
      {showBack && (
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center hover:bg-sky-200 transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <h1 className="text-sm font-black text-sky-700 uppercase tracking-widest">{title}</h1>
    </div>
    {rightElement || <div />}
  </div>
);

export const Spinner = ({ size = 'md' }) => {
  const sz = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return <div className={`${sz[size]} rounded-full animate-spin border-sky-100 border-t-sky-600`} style={{ borderWidth: 3, borderStyle: 'solid' }} />;
};

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-card overflow-hidden relative z-10 animate-slideUp">
        <div className="p-6 text-center">
          <h3 className="text-lg font-black text-slate-900 mb-3">{title}</h3>
          <div className="text-slate-600 text-sm font-semibold leading-relaxed mb-5">{children}</div>
          <div className="flex gap-3">{footer}</div>
        </div>
      </div>
    </div>
  );
};

/* ─── Alert ─── */
export const Alert = ({ type = 'error', message }) => {
  if (!message) return null;
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-[#EDD9F5] border-[#D4A8E0] text-[#6B1B6C]',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  const icons = { error: '⚠️', success: '✅', warning: '⚠️', info: 'ℹ️' };
  return (
    <div className={`border rounded-2xl px-4 py-3 text-sm font-semibold flex items-start gap-2 ${styles[type]}`}>
      <span className="mt-0.5 shrink-0">{icons[type]}</span>
      {message}
    </div>
  );
};

export const Badge = ({ children, color = 'sky', className = '' }) => {
  const c = {
    sky: 'bg-sky-100 text-sky-600',
    purple: 'bg-sky-100 text-sky-600',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide ${c[color] || c.sky} ${className}`}>
      {children}
    </span>
  );
};

export const SectionTitle = ({ children, action }) => (
  <div className="flex items-center justify-between mb-3">
    <h3 className="font-black text-slate-900 text-base">{children}</h3>
    {action}
  </div>
);

export const EmptyState = ({ icon, title, desc }) => (
  <div className="text-center py-10 px-6">
    <div className="text-5xl mb-3">{icon}</div>
    <h4 className="font-black text-slate-900 mb-1">{title}</h4>
    <p className="text-sm text-slate-500 font-medium">{desc}</p>
  </div>
);
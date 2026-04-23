import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Fish, Activity, BookOpen, Bot } from 'lucide-react';
import { Button, InputField, Alert } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import logoSrc from '../../assets/Nutrisea_Logo.PNG';

/* ─── NutriSea desktop left panel ─── */
const AuthLeftPanel = () => (
  <div className="auth-left-panel hidden lg:flex font-sans"
    style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0891b2 40%, #06b6d4 100%)' }}>
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[{ top: '5%', left: '10%', size: 80 }, { top: '30%', right: '5%', size: 60 },
      { bottom: '15%', left: '8%', size: 50 }, { top: '60%', left: '40%', size: 100 },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', top: c.top, left: c.left, right: c.right, bottom: c.bottom,
          width: c.size, height: c.size, borderRadius: '50%', background: 'rgba(255,255,255,0.08)'
        }} />
      ))}
    </div>
    <div className="relative z-10 text-white text-center max-w-md mt-6">
      {/* Wordmark */}
      <div className="flex items-center gap-3 justify-center mb-8">
        <img src={logoSrc} alt="NutriSea" className="h-53 w-auto object-contain brightness-0 invert" />
      </div>

      <h1 className="text-3xl font-black mb-3 tracking-tight leading-tight">
        Solusi Intervensi<br />Stunting Modern
      </h1>
      <p className="text-white/85 text-sm font-semibold leading-relaxed mb-8 w-4/5 mx-auto">
        Gummy fauna laut bernutrisi tinggi untuk tumbuh kembang si kecil yang optimal.
      </p>
      <div className="space-y-3 w-full">
        {[
          { icon: Activity, text: 'Pantau Tumbuh Kembang Anak Real-Time' },
          { icon: Fish, text: 'Gummy NutriSea dari Ekstrak Fauna Laut' },
          { icon: Bot, text: 'Konsultasi AI Nutri-Bot 24/7' },
          { icon: BookOpen, text: 'Edukasi Gizi Stunting Terkurasi' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl px-5 py-3.5 backdrop-blur-md border border-white/10">
            <div className="bg-white/20 p-2 rounded-xl shrink-0"><Icon size={16} /></div>
            <span className="text-sm font-bold text-white tracking-wide text-left">{text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email wajib diisi.'); return; }
    if (!password) { setError('Password wajib diisi.'); return; }
    if (!email.includes('@')) { setError('Format email tidak valid.'); return; }
    setError(''); setLoading(true);
    try {
      const { user } = await signIn(email.trim(), password);
      if (!user) throw new Error('Pengguna tidak ditemukan.');
      const metaRole = user.user_metadata?.role?.toLowerCase();
      if (metaRole === 'admin' || metaRole === 'superadmin') { navigate('/admin'); return; }
      try {
        const result = await Promise.race([
          supabase.from('profiles').select('role').eq('id', user.id).single(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
        ]);
        navigate(result?.data?.role?.toLowerCase() === 'admin' ? '/admin' : '/');
      } catch { navigate('/'); }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-outer">
      <AuthLeftPanel />
      <div className="auth-card" style={{ background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)' }}>
        <div className="flex flex-col min-h-full px-7 py-8 lg:py-10 relative">
          {/* Desktop logo for right panel */}
          <div className="hidden lg:flex justify-center mb-8">
            <img src={logoSrc} alt="NutriSea" className="h-43 w-auto object-contain" />
          </div>

          {/* Mobile brand */}
          <div className="flex justify-center mb-8 mt-2 lg:hidden">
            <img src={logoSrc} alt="NutriSea" className="h-43 w-auto object-contain" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-1">Masuk ke Akun</h2>
          <p className="text-sm text-slate-500 font-semibold mb-8">Pantau tumbuh kembang si kecil bersama NutriSea 🐠</p>


          {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

          <form onSubmit={handleLogin} className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Email</label>
              <InputField icon={Mail} placeholder="nama@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Kata Sandi</label>
                <Link to="/forgot-password" className="text-xs font-bold text-sky-600 hover:text-sky-700">Lupa password?</Link>
              </div>
              <InputField icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-sky-600 transition">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>
            <div className="mt-auto pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memproses...</>
                  : <><span>Masuk</span><ArrowRight size={16} /></>}
              </Button>
            </div>
          </form>

          <div className="mt-4 border-2 border-dashed border-sky-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-2">🔑 Akun Demo</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-sky-50 rounded-xl p-2.5">
                <p className="font-black text-sky-700 text-[10px] uppercase mb-1">Bunda</p>
                <p className="text-slate-600 font-bold break-all">user@nutrisea.id</p>
                <p className="text-slate-400 font-semibold">Pass: 12345678</p>
              </div>
              <div className="bg-sky-50 rounded-xl p-2.5">
                <p className="font-black text-sky-700 text-[10px] uppercase mb-1">Kader</p>
                <p className="text-slate-600 font-bold break-all">admin@nutrisea.id</p>
                <p className="text-slate-400 font-semibold">Pass: 12345678</p>
              </div>

            </div>
          </div>

          <p className="text-center mt-5 mb-2 text-sm text-slate-500 font-semibold">
            Belum punya akun?{' '}
            <Link to="/register" className="text-sky-600 font-black hover:text-sky-700">Daftar Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, InputField, Alert, FloatingPills } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import logoSrc from '../../assets/Bilova_Logo.png';

/* ─── Desktop Left Panel ─── */
const AuthLeftPanel = () => (
  <div className="auth-left-panel hidden lg:flex font-sans">
    {/* Pills floating background */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { top: '10%', left: '8%', rot: 20, w: 60, h: 28 },
        { top: '22%', right: '12%', rot: -15, w: 44, h: 20 },
        { top: '55%', left: '5%', rot: 45, w: 36, h: 36, round: true },
        { bottom: '20%', right: '8%', rot: 60, w: 50, h: 24 },
        { bottom: '8%', left: '20%', rot: -30, w: 40, h: 18 },
        { top: '38%', right: '5%', rot: 10, w: 55, h: 25 },
      ].map((p, i) => (
        <div key={i} style={{ position: 'absolute', ...p, transform: `rotate(${p.rot}deg)`, opacity: 0.3 }}>
          {p.round
            ? <div style={{ width: p.w, height: p.h, borderRadius: '50%', background: 'rgba(237,217,245,0.6)' }} />
            : <div style={{ width: p.w, height: p.h, borderRadius: p.h / 2, background: 'rgba(237,217,245,0.5)' }} />
          }
        </div>
      ))}
    </div>
    <div className="relative z-10 text-white text-center max-w-md mt-10">
      <img src={logoSrc} alt="BiLova" className="w-48 h-auto object-contain mx-auto mb-8 brightness-0 invert" />
      <h1 className="text-4xl font-black mb-4 tracking-tight leading-tight">Selamat Datang di<br />BiLova</h1>
      <p className="text-white/90 text-base font-semibold leading-relaxed mb-10 w-4/5 mx-auto">
        Asisten pintar pengingat antibiotik Anda.<br />
        Minum tepat waktu, sembuh sempurna.
      </p>
      {/* Feature highlights */}
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl px-5 py-4 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="bg-white/20 p-2.5 rounded-xl"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg></div>
          <span className="text-sm font-bold text-white tracking-wide text-left">Jadwal Minum Obat Otomatis & Pengingat</span>
        </div>
        <div className="flex items-center gap-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl px-5 py-4 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="bg-white/20 p-2.5 rounded-xl"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
          <span className="text-sm font-bold text-white tracking-wide text-left">Pantau Kepatuhan Pengobatan Harian</span>
        </div>
        <div className="flex items-center gap-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl px-5 py-4 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="bg-white/20 p-2.5 rounded-xl"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></div>
          <span className="text-sm font-bold text-white tracking-wide text-left">Laporkan Gejala Langsung ke Dokter</span>
        </div>
        <div className="flex items-center gap-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl px-5 py-4 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="bg-white/20 p-2.5 rounded-xl"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
          <span className="text-sm font-bold text-white tracking-wide text-left">Edukasi Resistansi Antibiotik (AMR)</span>
        </div>
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
      // Prioritize JWT metadata for role (fast, no DB call)
      const metaRole = user.user_metadata?.role?.toLowerCase();
      if (metaRole === 'admin' || metaRole === 'superadmin') {
        navigate('/admin'); return;
      }
      // DB fallback with timeout
      try {
        const result = await Promise.race([
          supabase.from('profiles').select('role').eq('id', user.id).single(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
        ]);
        const role = result?.data?.role?.toLowerCase();
        navigate(role === 'admin' ? '/admin' : '/');
      } catch { navigate('/'); }
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-outer">
      <AuthLeftPanel />
      {/* Right panel / full screen on mobile */}
      <div className="auth-card">
        <div className="flex flex-col min-h-full px-7 py-8 lg:py-10 relative">
          <FloatingPills />
          {/* Logo */}
          <div className="flex justify-center mb-6 mt-2">
            <img src={logoSrc} alt="BiLova" className="h-16 w-auto object-contain" />
          </div>

          <h2 className="text-2xl font-black text-[#2D1B3D] mb-1">Masuk ke Akun</h2>
          <p className="text-sm text-[#B090C0] font-semibold mb-6">Lanjutkan perjalanan sehat Anda bersama BiLova</p>

          {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

          <form onSubmit={handleLogin} className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-2 block">Email</label>
              <InputField icon={Mail} placeholder="nama@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider">Kata Sandi</label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#8B2C8C] hover:text-[#C85CA0]">Lupa password?</Link>
              </div>
              <InputField icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#B090C0] hover:text-[#8B2C8C] transition">
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

          {/* Demo credentials — compact callout */}
          <div className="mt-4 border-2 border-dashed border-[#EDD9F5] rounded-2xl p-4">
            <p className="text-[10px] font-black text-[#8B2C8C] uppercase tracking-widest mb-2">🔑 Akun Demo</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#EDD9F5]/60 rounded-xl p-2.5">
                <p className="font-black text-[#6B1B6C] text-[10px] uppercase mb-1">Pasien</p>
                <p className="text-[#6B4B7B] font-bold break-all">user@bilova.com</p>
                <p className="text-[#B090C0] font-semibold">Pass: 12345678</p>
              </div>
              <div className="bg-[#EDD9F5]/60 rounded-xl p-2.5">
                <p className="font-black text-[#6B1B6C] text-[10px] uppercase mb-1">Admin</p>
                <p className="text-[#6B4B7B] font-bold break-all">admin@bilova.com</p>
                <p className="text-[#B090C0] font-semibold">Pass: 12345678</p>
              </div>
            </div>
          </div>

          <p className="text-center mt-5 mb-2 text-sm text-[#6B4B7B] font-semibold">
            Belum punya akun?{' '}
            <Link to="/register" className="text-[#8B2C8C] font-black hover:text-[#C85CA0]">Daftar Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
import React, { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Fish, Activity, BookOpen, Bot } from 'lucide-react';
import { Button, InputField, Alert, NutriSeaLogoImg } from '../../components/UIComponents';

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
        <div key={i} style={{ position: 'absolute', top: c.top, left: c.left, right: c.right, bottom: c.bottom,
          width: c.size, height: c.size, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      ))}
    </div>
    <div className="relative z-10 text-white text-center max-w-sm">
      {/* Brand logo - Slightly enlarged and proportional */}
      <div className="flex items-center justify-center mb-4">
        <NutriSeaLogoImg h="" className="brightness-0 invert" style={{ height: '96px' }} />
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

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

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
    <>
      <style>{`
        #root { background: transparent !important; }
        .nuclear-outer { position: fixed !important; inset: 0 !important; z-index: 100 !important; display: flex !important; align-items: stretch !important; background: transparent !important; }
        .nuclear-left { flex: 1 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: transparent !important; }
        .nuclear-right { width: 440px !important; min-width: 440px !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; background: transparent !important; }
        @media (max-width: 1023px) {
          .nuclear-left { display: none !important; }
          .nuclear-right { width: 100% !important; min-width: 100% !important; }
        }
      `}</style>

      <div className="nuclear-outer">
        {/* Left Panel */}
        <div className="nuclear-left hidden lg:flex">
          <div style={{ textAlign: 'center', maxWidth: '320px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <NutriSeaLogoImg h="" className="brightness-0 invert" style={{ height: '96px' }} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '0.75rem', lineHeight: 1.2 }}>Solusi Intervensi<br />Stunting Modern</h1>
            <p style={{ fontSize: '14px', opacity: 0.9, fontWeight: 600, marginBottom: '2rem' }}>
              Gummy fauna laut bernutrisi tinggi untuk tumbuh kembang si kecil yang optimal.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: Activity, text: 'Pantau Tumbuh Kembang 24/7' },
                { icon: Fish, text: 'Ekstrak Fauna Laut Organik' },
                { icon: Bot, text: 'Konsultasi Nutri-Bot AI' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.1)', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Icon size={16} />
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="nuclear-right">
          <div style={{ width: '100%', maxWidth: '360px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <NutriSeaLogoImg h="" style={{ height: '72px' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>Kembali Pantau Nutrisi</h2>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '2rem' }}>Masuk untuk melanjutkan perjalanan tumbuh kembang si kecil 🐠</p>

              {error && <div style={{ width: '100%', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '12px', marginBottom: '1.5rem', fontWeight: 700 }}>{error}</div>}

              <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '100%' }}>
                  <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Email</label>
                  <input 
                    style={{ width: '100%', padding: '0.75rem 1.25rem', border: '2px solid #f1f5f9', fontWeight: 700, fontSize: '14px', outline: 'none' }}
                    placeholder="nama@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} 
                  />
                </div>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Password</label>
                    <Link to="/forgot-password" style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>Lupa?</Link>
                  </div>
                  <input 
                     style={{ width: '100%', padding: '0.75rem 1.25rem', border: '2px solid #f1f5f9', fontWeight: 700, fontSize: '14px', outline: 'none' }}
                     type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} 
                  />
                </div>
                
                <button type="submit" disabled={loading} 
                  style={{ width: '100%', background: '#0284c7', color: 'white', fontWeight: 900, padding: '1rem', border: 'none', cursor: 'pointer', marginTop: '1rem', fontSize: '14px' }}>
                  {loading ? 'MEMPROSES...' : 'MASUK'}
                </button>
              </form>

              <div style={{ marginTop: '2rem', border: '2px dashed #e0f2fe', padding: '1rem', width: '100%' }}>
                <p style={{ fontSize: '10px', fontWeight: 900, color: '#0284c7', textTransform: 'uppercase', marginBottom: '0.75rem' }}>🔑 Akun Demo</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: '#f0f9ff', padding: '0.75rem' }}>
                    <p style={{ fontSize: '10px', fontWeight: 900, color: '#0369a1', margin: '0 0 0.25rem 0' }}>BUNDA</p>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#334155', margin: 0, wordBreak: 'break-all' }}>user@bilova.com</p>
                  </div>
                  <div style={{ background: '#f0f9ff', padding: '0.75rem' }}>
                    <p style={{ fontSize: '10px', fontWeight: 900, color: '#0369a1', margin: '0 0 0.25rem 0' }}>ADMIN</p>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#334155', margin: 0, wordBreak: 'break-all' }}>admin@bilova.com</p>
                  </div>
                </div>
              </div>

              <p style={{ marginTop: '2rem', fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
                Belum punya akun? <Link to="/register" style={{ color: '#0284c7', fontWeight: 900 }}>Daftar Sekarang</Link>
              </p>
          </div>
        </div>
      </div>
    </>
  );
};





export default LoginScreen;
import React, { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ChevronLeft, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button, InputField, Alert, FloatingPills, NutriSeaLogoImg } from '../../components/UIComponents';

import { useAuth } from '../../contexts/AuthContext';
import logoSrc from '../../assets/Nutrisea_Logo.PNG';

const WHATSAPP_SUPPORT = '6289690815134';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!email.trim()) { setError('Email wajib diisi.'); return; }
    if (!email.includes('@')) { setError('Format email tidak valid.'); return; }
    setError(''); setLoading(true);
    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleWASupport = () => {
    const msg = `Halo Admin NutriSea, mau tanya soal [ganti dengan masalahmu]. Bisa bantu?`;
    window.open(`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="auth-outer">
      {/* Desktop left panel */}
      <div className="auth-left-panel hidden lg:flex">
        <div className="relative z-10 text-white text-center max-w-sm">
          <NutriSeaLogoImg h="" className="mx-auto mb-6 brightness-0 invert" style={{ height: '100px' }} />
          <h1 className="text-3xl font-black mb-3">Lupa Password?</h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Tenang, kami akan membantu Anda memulihkan akses ke akun NutriSea Anda dengan aman.
          </p>


        </div>
      </div>



      {/* Right panel */}
      <div className="auth-card">
        <div className="flex flex-col w-full px-7 py-4 relative h-full justify-center items-center overflow-hidden">
          <div className="w-full max-w-[420px]">
            <FloatingPills />
            {/* Back */}
            <Link to="/login" className="flex items-center gap-1 text-[#8B2C8C] font-bold text-sm mb-4 w-fit hover:text-[#C85CA0]">
              <ChevronLeft size={18} /> Kembali
            </Link>
            <div className="flex justify-center mb-6">
              <NutriSeaLogoImg h="" style={{ height: '80px' }} />
            </div>







          {success ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 animate-slideUp">
              <div className="text-6xl">📬</div>
              <h2 className="text-2xl font-black text-[#2D1B3D]">Email Terkirim!</h2>
              <p className="text-sm text-[#6B4B7B] font-semibold leading-relaxed max-w-xs">
                Instruksi reset password telah dikirim ke <strong>{email}</strong>. Periksa kotak masuk Anda.
              </p>
              <Button onClick={() => navigate('/login')}>Kembali ke Halaman Masuk</Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black text-slate-900 mb-1">Pulihkan Akun Anda</h2>
              <p className="text-[11px] text-slate-500 font-semibold mb-4 text-center">
                Jangan khawatir, kami akan membantu Anda masuk kembali. Masukkan email Anda untuk menerima tautan pemulihan.
              </p>


              {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-2 block">Alamat Email</label>
                  <InputField icon={Mail} type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Mengirim...</>
                    : <><span>Kirim Instruksi Reset</span><ArrowRight size={16} /></>}
                </Button>
              </form>

              {/* Info cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
                  <ShieldCheck size={22} className="text-sky-600 mb-2" />
                  <h4 className="font-black text-sky-900 text-xs mb-1">Aman & Terenkripsi</h4>
                  <p className="text-[10px] text-sky-600/70 font-semibold">Data medis Anda terlindungi selama proses pemulihan.</p>
                </div>
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
                  <HelpCircle size={22} className="text-sky-600 mb-2" />
                  <h4 className="font-black text-sky-900 text-xs mb-1">Butuh Bantuan?</h4>
                  <p className="text-[10px] text-sky-600/70 font-semibold">Tim kami siap membantu Anda kembali ke akun.</p>
                </div>
              </div>

              {/* WhatsApp support */}
              <button onClick={handleWASupport}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-[#25D366] text-[#25D366] font-black text-sm hover:bg-[#25D366]/10 transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.659 1.438 5.168L2 22l4.969-1.303A9.94 9.94 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 1.8a8.2 8.2 0 110 16.4 8.2 8.2 0 010-16.4z" opacity=".3" />
                </svg>
                Chat WhatsApp Support
              </button>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default ForgotPasswordScreen;
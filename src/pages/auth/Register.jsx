import React, { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Phone } from 'lucide-react';
import { Button, InputField, Alert, FloatingPills, NutriSeaLogoImg } from '../../components/UIComponents';

import { useAuth } from '../../contexts/AuthContext';
import logoSrc from '../../assets/Nutrisea_Logo.PNG';

/* ─── Profile Completion Form (shown right after registration is confirmed) ─── */
const ProfileCompletionStep = ({ userId, onDone }) => {
  const { updateProfile } = useAuth();
  const [form, setForm] = useState({ phone: '', gender: '', date_of_birth: '', allergy_info: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.gender || !form.date_of_birth) {
      setError('Nomor telepon, jenis kelamin, dan tanggal lahir wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ ...form, is_profile_complete: true });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col px-7 py-8 min-h-full">
      <div className="flex justify-center mb-6 mt-2">
        <img src={logoSrc} alt="NutriSea" className="h-14 w-auto object-contain" />
      </div>
      <h2 className="text-2xl font-black text-[#2D1B3D] mb-1">Lengkapi Profil</h2>
      <p className="text-sm text-[#B090C0] font-semibold mb-5">Data ini diperlukan agar dokter dapat memantau pengobatan Anda dengan tepat.</p>
      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
        <div>
          <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-2 block">Nomor Telepon *</label>
          <InputField icon={Phone} name="phone" placeholder="08xxxxxxxxx" type="tel" value={form.phone} onChange={handle} />
        </div>
        <div>
          <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-2 block">Jenis Kelamin *</label>
          <select name="gender" value={form.gender} onChange={handle}
            className="w-full bg-white border-2 border-[#EDD9F5] rounded-2xl px-4 py-3 text-[#2D1B3D] font-semibold text-sm focus:outline-none focus:border-[#8B2C8C] transition">
            <option value="">-- Pilih jenis kelamin --</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-2 block">Tanggal Lahir *</label>
          <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handle}
            className="w-full bg-white border-2 border-[#EDD9F5] rounded-2xl px-4 py-3 text-[#2D1B3D] font-semibold text-sm focus:outline-none focus:border-[#8B2C8C] transition" />
        </div>
        <div>
          <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-2 block">Info Alergi <span className="text-[#B090C0] normal-case font-semibold">(opsional)</span></label>
          <InputField icon={ShieldCheck} name="allergy_info" placeholder="Misal: Penisilin" value={form.allergy_info} onChange={handle} />
        </div>
        <div className="mt-auto pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Menyimpan...</>
              : <><span>Simpan & Mulai</span><ArrowRight size={16} /></>}
          </Button>
        </div>
      </form>
    </div>
  );
};

const RegisterScreen = () => {
  const [step, setStep] = useState('form'); // 'form' | 'profile'
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newUserId, setNewUserId] = useState(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  const handleRegister = async (e) => {

    e.preventDefault();
    setError('');
    if (!form.fullName.trim()) { setError('Nama lengkap wajib diisi.'); return; }
    if (!form.email.trim()) { setError('Email wajib diisi.'); return; }
    if (!form.email.includes('@')) { setError('Format email tidak valid.'); return; }
    if (!form.password) { setError('Password wajib diisi.'); return; }
    if (form.password.length < 8) { setError('Password minimal 8 karakter.'); return; }
    if (form.password !== form.confirmPassword) { setError('Password dan konfirmasi tidak cocok.'); return; }
    if (!agreed) { setError('Anda harus menyetujui Syarat & Ketentuan BiLova.'); return; }
    setLoading(true);
    try {
      const result = await Promise.race([
        signUp(form.email.trim(), form.password, form.fullName.trim()),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Koneksi lambat. Akun mungkin sudah dibuat, cek email Anda.')), 15000))
      ]);
      if (result?.user) {
        setNewUserId(result.user.id);
        setStep('profile');
      } else {
        // Email confirmation required
        setStep('confirm');
      }
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  if (step === 'confirm') {
    return (
      <div className="auth-outer">
        <div className="auth-card flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-black text-[#2D1B3D] mb-3">Cek Email Anda!</h2>
            <p className="text-sm text-[#6B4B7B] font-semibold mb-6">
              Kami mengirim tautan verifikasi ke <strong>{form.email}</strong>.
              Klik tautan tersebut untuk mengaktifkan akun Anda.
            </p>
            <Button onClick={() => navigate('/login')}>Ke Halaman Masuk</Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="auth-outer">
        <div className="auth-card">
          <ProfileCompletionStep userId={newUserId} onDone={() => navigate('/')} />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-outer">
      {/* Desktop left panel */}
      <div className="auth-left-panel hidden lg:flex">
        <div className="relative z-10 text-white text-center max-w-sm">
          <NutriSeaLogoImg h="" className="mx-auto mb-6 brightness-0 invert" style={{ height: '100px' }} />



          <h1 className="text-3xl font-black mb-3">Bergabunglah<br />dengan NutriSea</h1>
          <p className="text-white/80 text-sm leading-relaxed">Daftarkan si kecil dan mulai perjalanan pemantauan gizi yang lebih teratur, aman, dan efektif.</p>
        </div>
      </div>






      <div className="auth-card">
        <div className="flex flex-col w-full px-7 py-4 relative h-full justify-center items-center overflow-hidden">
          <div className="w-full max-w-[420px]">
            <FloatingPills />
            <div className="flex justify-center mb-6">
              <NutriSeaLogoImg h="" style={{ height: '80px' }} />
            </div>








          <h2 className="text-xl font-black text-slate-900 mb-1">Mari Tumbuh Bersama</h2>
          <p className="text-[11px] text-slate-500 font-semibold mb-4 text-center">Mulai langkah cerdas cegah stunting dengan NutriSea. Pemantauan gizi jadi lebih mudah dan teratur.</p>


          {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

          <form onSubmit={handleRegister} className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-2 block">Nama Lengkap</label>
              <InputField icon={User} name="fullName" placeholder="Nama lengkap Anda" value={form.fullName} onChange={handle} />
            </div>
            <div>
              <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-2 block">Email</label>
              <InputField icon={Mail} name="email" type="email" placeholder="contoh@email.com" value={form.email} onChange={handle} />
            </div>
            <div>
              <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-2 block">Password</label>
              <InputField icon={Lock} name="password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 karakter" value={form.password} onChange={handle}
                rightIcon={
                  <button type="button" onClick={() => setShowPass(!showPass)} className="text-[#B090C0] hover:text-[#8B2C8C] transition">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>
            <div>
              <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-2 block">Konfirmasi Password</label>
              <InputField icon={ShieldCheck} name="confirmPassword" type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={handle} />
            </div>
            <div className="flex items-start gap-3">
              <button type="button" onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded-md border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-all ${agreed ? 'bg-[#8B2C8C] border-[#8B2C8C]' : 'border-[#EDD9F5]'}`}>
                {agreed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
              </button>
              <p className="text-xs text-[#6B4B7B] font-semibold leading-relaxed">
                Saya menyetujui <span className="text-sky-600 font-black">Syarat & Ketentuan</span> serta <span className="text-sky-600 font-black">Kebijakan Privasi</span> NutriSea.
              </p>
            </div>
            <div className="mt-auto pt-1">
              <Button type="submit" disabled={loading}>
                {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Mendaftar...</>
                  : <><span>Daftar Sekarang</span><ArrowRight size={16} /></>}
              </Button>
            </div>
          </form>
          <p className="text-center mt-5 mb-2 text-sm text-[#6B4B7B] font-semibold">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#8B2C8C] font-black hover:text-[#C85CA0]">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};


export default RegisterScreen;
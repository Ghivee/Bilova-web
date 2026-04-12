import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button, InputField } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';

const RegisterScreen = () => {
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dots, setDots] = useState('');
    const { signUp } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setDots(prev => prev.length >= 3 ? '' : prev + '.');
            }, 400);
            return () => clearInterval(interval);
        } else {
            setDots('');
        }
    }, [loading]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
            setError('Semua field wajib diisi.');
            return;
        }
        if (form.password.length < 8) {
            setError('Password minimal 8 karakter.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Password dan konfirmasi tidak cocok.');
            return;
        }
        if (!agreed) {
            setError('Anda harus menyetujui Syarat & Ketentuan.');
            return;
        }

        setLoading(true);
        try {
            // Gunakan Promise.race untuk cegah hang permanen saat koneksi tidak stabil
            const signUpPromise = signUp(form.email, form.password, form.fullName);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('timeout')), 15000)
            );

            await Promise.race([signUpPromise, timeoutPromise]);
            setSuccess(true);
        } catch (err) {
            console.error('Register error:', err);
            if (err.message === 'timeout') {
                setError('Proses pendaftaran memakan waktu terlalu lama. Silakan cek email Anda atau coba masuk langsung, kemungkinan akun sudah berhasil dibuat.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col min-h-full px-6 py-8 items-center justify-center">
                <div className="bg-[#DFF0EE] p-6 rounded-full mb-6">
                    <ShieldCheck size={48} className="text-[#138476]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">Pendaftaran Berhasil!</h2>
                <p className="text-slate-500 text-center mb-8 font-medium">Cek email Anda untuk verifikasi akun sebelum masuk.</p>
                <Button onClick={() => navigate('/login')}>Ke Halaman Masuk</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleRegister} className="flex flex-col min-h-full px-6 py-8 relative z-10">
            <div className="flex items-center gap-2 mb-8 mt-4 justify-center">
                <div className="bg-[#138476] p-2 rounded-xl">
                    <ShieldCheck size={20} color="white" />
                </div>
                <h1 className="text-2xl font-extrabold text-[#138476] tracking-wider">BILOVA</h1>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Buat Akun Baru</h2>
            <p className="text-slate-500 mb-8 font-medium">Lengkapi data di bawah untuk memulai perjalanan sehat Anda.</p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="space-y-5">
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Nama Lengkap</label>
                    <InputField icon={User} placeholder="Masukkan nama lengkap" name="fullName" value={form.fullName} onChange={handleChange} />
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Email</label>
                    <InputField icon={Mail} placeholder="contoh@email.com" type="email" name="email" value={form.email} onChange={handleChange} />
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Password</label>
                    <InputField icon={Lock} type="password" placeholder="Min. 8 karakter" name="password" value={form.password} onChange={handleChange} />
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Konfirmasi Password</label>
                    <InputField icon={ShieldCheck} type="password" placeholder="Ulangi password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
                </div>
            </div>

            <div className="flex items-start gap-3 mt-6 mb-8">
                <button
                    type="button"
                    onClick={() => setAgreed(!agreed)}
                    className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${agreed ? 'bg-[#138476] border-[#138476]' : 'border-slate-300'}`}
                >
                    {agreed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </button>
                <p className="text-sm text-slate-600 leading-relaxed">
                    Saya menyetujui <span className="text-[#138476] font-bold">Syarat & Ketentuan</span> serta <span className="text-[#138476] font-bold">Kebijakan Privasi</span> BILOVA.
                </p>
            </div>

            <Button type="submit" disabled={loading} className="mb-8">
                {loading ? `Mendaftar${dots}` : <><span>Daftar Sekarang</span> <ArrowRight size={20} /></>}
            </Button>
            <p className="text-center font-medium text-slate-600 mb-8">
                Sudah memiliki akun?{' '}
                <Link to="/login" className="text-[#138476] font-bold">Masuk di sini</Link>
            </p>
        </form>
    );
};

export default RegisterScreen;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, InputField } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const LoginScreen = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [dots, setDots] = useState('');
    const { signIn } = useAuth();
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

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Silakan isi email dan password.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const { user } = await signIn(email, password);
            if (!user) throw new Error('Pengguna tidak ditemukan.');
            
            // Prioritas 1: Gunakan metadata (Sangat cepat & tidak bergantung pada tabel profiles)
            const metaRole = user.user_metadata?.role?.toLowerCase();
            console.log('Role from metadata:', metaRole);

            // Jika metadata sudah ada role admin, langsung gaskeun
            if (metaRole === 'admin' || metaRole === 'superadmin') {
                navigate('/admin');
                return;
            }

            // Prioritas 2: Ambil dari DB dengan timeout 5 detik (Backup jika metadata kosong)
            try {
                const profilePromise = supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                // Balapan dengan timeout
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('timeout')), 5000)
                );

                const { data: profile } = await Promise.race([profilePromise, timeoutPromise]);
                
                const userRole = profile?.role?.toLowerCase();
                if (userRole === 'admin' || userRole === 'superadmin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } catch (dbErr) {
                console.warn('Profile fetch handled (timeout or error):', dbErr.message);
                // Fallback terakhir: default ke user dashboard atau email check
                if (user.email.includes('admin@')) {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            let msg = 'Terjadi kesalahan saat masuk.';
            if (err.message === 'Invalid login credentials') msg = 'Email atau password salah.';
            else if (err.message.includes('Email not confirmed')) msg = 'Silakan verifikasi email Anda.';
            else if (err.message.includes('supabase')) msg = 'Kesalahan sistem (Supabase tidak terhubung).';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-full px-6 py-8 relative z-10">
            <div className="flex justify-center mb-8 mt-12">
                <div className="bg-[#138476] p-4 rounded-3xl shadow-lg shadow-teal-500/20">
                    <Activity size={32} color="white" />
                </div>
            </div>
            <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">BILOVA</h1>
            <p className="text-center text-slate-500 mb-10 font-medium">Asisten pintar pengingat antibiotik Anda</p>

            <form onSubmit={handleLogin} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold mb-6">Masuk ke Akun</h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Email</label>
                        <InputField
                            icon={Mail}
                            placeholder="nama@email.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-slate-700 block">Kata Sandi</label>
                            <Link to="/forgot-password" className="text-sm font-bold text-[#138476]">Lupa Password?</Link>
                        </div>
                        <InputField
                            icon={Lock}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            rightIcon={
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            }
                        />
                    </div>
                </div>
                <div className="mt-8">
                    <Button type="submit" disabled={loading}>
                        {loading ? `Memproses${dots}` : 'Masuk'}
                    </Button>
                </div>
                <div className="flex items-center gap-4 my-8">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-sm text-slate-400 font-medium">atau masuk dengan</span>
                    <div className="h-px bg-slate-200 flex-1" />
                </div>
                <div className="flex gap-4 mb-6">
                    <button type="button" className="flex-1 bg-slate-100 py-3 rounded-2xl flex items-center justify-center font-semibold text-slate-700 hover:bg-slate-200 transition">Google</button>
                    <button type="button" className="flex-1 bg-slate-100 py-3 rounded-2xl flex items-center justify-center font-semibold text-slate-700 hover:bg-slate-200 transition">Apple</button>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2">Akses Demo (Jika belum punya akun)</p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-emerald-700">Pasien: user@bilova.com</span>
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded-md text-emerald-600 border border-emerald-100 font-bold tracking-tighter self-center">pass: 12345678</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-emerald-700">Admin: admin@bilova.com</span>
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded-md text-emerald-600 border border-emerald-100 font-bold tracking-tighter self-center">pass: 12345678</span>
                        </div>
                    </div>
                </div>
            </form>
            <p className="text-center mt-8 font-medium text-slate-600">
                Belum punya akun?{' '}
                <Link to="/register" className="text-[#138476] font-bold">Daftar sekarang</Link>
            </p>
        </div>
    );
};

export default LoginScreen;
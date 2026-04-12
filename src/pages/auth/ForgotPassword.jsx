import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button, InputField, Header } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Masukkan alamat email Anda.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col min-h-full px-6 py-8 items-center justify-center">
                <div className="bg-[#DFF0EE] p-6 rounded-full mb-6">
                    <Mail size={48} className="text-[#138476]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">Email Terkirim!</h2>
                <p className="text-slate-500 text-center mb-8 font-medium">Cek inbox email Anda untuk instruksi reset password.</p>
                <Link to="/login" className="text-[#138476] font-bold flex items-center gap-2">
                    Kembali ke Masuk <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col min-h-full px-6 py-8 relative">
            <Header title="BILOVA" showBack onBack={() => window.history.back()} rightElement={<div />} />

            <div className="mt-8 mb-10">
                <h2 className="text-4xl font-extrabold text-slate-800 leading-tight">Atur Ulang</h2>
                <h2 className="text-4xl font-extrabold text-[#138476] leading-tight mb-4">Kata Sandi</h2>
                <p className="text-slate-600 text-lg font-medium leading-relaxed">
                    Jangan khawatir. Masukkan alamat email yang terdaftar dan kami akan mengirimkan instruksi untuk memulihkan akun Anda.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50 mb-8">
                <label className="text-sm font-semibold text-slate-700 mb-3 block">Alamat Email</label>
                <InputField icon={Mail} placeholder="nama@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <div className="mt-6">
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Mengirim...' : <><span>Kirim Instruksi</span> <ArrowRight size={20} /></>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100/50 rounded-3xl p-5 border border-slate-100">
                    <div className="bg-[#138476] w-10 h-10 rounded-full flex items-center justify-center mb-4"><ShieldCheck size={20} color="white" /></div>
                    <h4 className="font-bold text-slate-800 mb-2">Aman & Terenkripsi</h4>
                    <p className="text-sm text-slate-500 font-medium">Data medis Anda tetap terlindungi selama proses pemulihan.</p>
                </div>
                <div className="bg-slate-100/50 rounded-3xl p-5 border border-slate-100">
                    <div className="bg-[#138476] w-10 h-10 rounded-full flex items-center justify-center mb-4"><HelpCircle size={20} color="white" /></div>
                    <h4 className="font-bold text-slate-800 mb-2">Butuh Bantuan?</h4>
                    <p className="text-sm text-slate-500 font-medium">Hubungi tim dukungan kami jika Anda mengalami kendala.</p>
                </div>
            </div>
            <Link to="/login" className="mt-12 flex items-center justify-center gap-2 font-bold text-[#138476]">
                Kembali ke halaman Masuk <ArrowRight size={18} />
            </Link>
        </form>
    );
};

export default ForgotPasswordScreen;
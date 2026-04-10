import React from 'react';
import { Mail, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button, InputField, Header } from '../../components/UIComponents';

const ForgotPasswordScreen = ({ onNavigate }) => {
    return (
        <div className="flex flex-col min-h-full px-6 py-8 relative">
            <Header title="BILOVA" showBack onBack={() => onNavigate('login')} rightElement={<div />} />

            <div className="mt-8 mb-10">
                <h2 className="text-4xl font-extrabold text-slate-800 leading-tight">Atur Ulang</h2>
                <h2 className="text-4xl font-extrabold text-[#138476] leading-tight mb-4">Kata Sandi</h2>
                <p className="text-slate-600 text-lg font-medium leading-relaxed">Jangan khawatir. Masukkan alamat email yang terdaftar dan kami akan mengirimkan instruksi untuk memulihkan akun Anda.</p>
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50 mb-8">
                <label className="text-sm font-semibold text-slate-700 mb-3 block">Alamat Email</label>
                <InputField icon={Mail} placeholder="nama@email.com" />
                <div className="mt-6"><Button onClick={() => onNavigate('login')}>Kirim Instruksi <ArrowRight size={20} /></Button></div>
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
            <button onClick={() => onNavigate('login')} className="mt-12 flex items-center justify-center gap-2 font-bold text-[#138476]">
                Kembali ke halaman Masuk <ArrowRight size={18} />
            </button>
        </div>
    );
};

export default ForgotPasswordScreen;
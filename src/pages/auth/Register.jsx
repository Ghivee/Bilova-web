import React from 'react';
import { Activity, User, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button, InputField } from '../../components/UIComponents';

const RegisterScreen = ({ onNavigate }) => {
    return (
        <div className="flex flex-col min-h-full px-6 py-8">
            <div className="flex items-center gap-2 mb-8 mt-4 justify-center">
                <Activity size={28} className="text-[#138476]" />
                <h1 className="text-2xl font-extrabold text-[#138476] tracking-wider">BILOVA</h1>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Buat Akun Baru</h2>
            <p className="text-slate-500 mb-8 font-medium">Lengkapi data di bawah untuk memulai perjalanan sehat Anda.</p>

            <div className="space-y-5">
                <div><label className="text-sm font-semibold text-slate-700 mb-2 block">Nama Lengkap</label><InputField icon={User} placeholder="Masukkan nama lengkap" /></div>
                <div><label className="text-sm font-semibold text-slate-700 mb-2 block">Email</label><InputField icon={Mail} placeholder="contoh@email.com" /></div>
                <div><label className="text-sm font-semibold text-slate-700 mb-2 block">Password</label><InputField icon={Lock} type="password" placeholder="Min. 8 karakter" /></div>
                <div><label className="text-sm font-semibold text-slate-700 mb-2 block">Konfirmasi Password</label><InputField icon={ShieldCheck} type="password" placeholder="Ulangi password" /></div>
            </div>

            <div className="flex items-start gap-3 mt-6 mb-8">
                <div className="w-5 h-5 rounded border border-slate-300 mt-0.5 flex items-center justify-center"></div>
                <p className="text-sm text-slate-600 leading-relaxed">Saya menyetujui <span className="text-[#138476] font-bold">Syarat & Ketentuan</span> serta <span className="text-[#138476] font-bold">Kebijakan Privasi</span> BILOVA.</p>
            </div>

            <Button onClick={() => onNavigate('login')} className="mb-8">Daftar Sekarang <ArrowRight size={20} /></Button>
            <p className="text-center font-medium text-slate-600 mb-8">Sudah memiliki akun? <button onClick={() => onNavigate('login')} className="text-[#138476] font-bold">Masuk di sini</button></p>
        </div>
    );
};

export default RegisterScreen;
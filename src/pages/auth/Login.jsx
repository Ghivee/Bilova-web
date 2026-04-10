import React, { useState } from 'react';
import { Activity, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, InputField } from '../../components/UIComponents';

const LoginScreen = ({ onNavigate, onLogin }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex flex-col min-h-full px-6 py-8 relative z-10">
            <div className="flex justify-center mb-8 mt-12">
                <div className="bg-[#138476] p-4 rounded-3xl shadow-lg shadow-teal-500/20"><Activity size={32} color="white" /></div>
            </div>
            <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">BILOVA</h1>
            <p className="text-center text-slate-500 mb-10 font-medium">Asisten pintar pengingat antibiotik Anda</p>

            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold mb-6">Masuk ke Akun</h2>
                <div className="space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Email</label>
                        <InputField icon={Mail} placeholder="nama@email.com" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-slate-700 block">Kata Sandi</label>
                            <button onClick={() => onNavigate('forgot')} className="text-sm font-bold text-[#138476]">Lupa Password?</button>
                        </div>
                        <InputField
                            icon={Lock} type={showPassword ? "text" : "password"} placeholder="••••••••"
                            rightIcon={<button onClick={() => setShowPassword(!showPassword)} className="text-slate-400">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>}
                        />
                    </div>
                </div>
                <div className="mt-8"><Button onClick={onLogin}>Masuk</Button></div>
                <div className="flex items-center gap-4 my-8">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-sm text-slate-400 font-medium">atau masuk dengan</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                <div className="flex gap-4 mb-6">
                    <button className="flex-1 bg-slate-100 py-3 rounded-2xl flex items-center justify-center font-semibold text-slate-700">Google</button>
                    <button className="flex-1 bg-slate-100 py-3 rounded-2xl flex items-center justify-center font-semibold text-slate-700">Apple</button>
                </div>
            </div>
            <p className="text-center mt-8 font-medium text-slate-600">Belum punya akun? <button onClick={() => onNavigate('register')} className="text-[#138476] font-bold">Daftar sekarang</button></p>
        </div>
    );
};

export default LoginScreen;
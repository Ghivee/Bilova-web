import React from 'react';
import { ShieldCheck, AlertTriangle, Calendar as CalendarIcon, Pill, Star, Sparkles, History, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Header, CircularProgress } from '../../components/UIComponents';

const Profil = ({ onLogout }) => {
    return (
        <div className="pb-24">
            <Header title="BILOVA" />
            <div className="flex flex-col items-center mt-6 px-6 relative z-10">
                <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#138476] shadow-lg">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi&backgroundColor=1e293b" alt="Profile" className="w-full h-full object-cover bg-slate-800" />
                    </div>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800">Dr. Aris Setiawan</h2>
                <div className="mt-6 bg-[#FEE2E2] text-red-700 px-5 py-3 rounded-xl flex items-center gap-2 border border-red-200 w-full max-w-sm justify-center"><AlertTriangle size={20} /><span className="font-extrabold text-sm uppercase">Alergi Obat: Alergi Penisilin</span></div>
            </div>

            <div className="px-6 mt-10 space-y-6">
                <div className="bg-slate-50 rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div className="w-1/2"><h3 className="font-extrabold text-lg text-slate-800 mb-2">Rapor Kepatuhan</h3></div>
                    <div className="w-1/2 flex justify-end"><CircularProgress percentage={85} size={110} strokeWidth={12} /></div>
                </div>

                <div className="space-y-3 mt-4">
                    <button className="w-full bg-slate-50 rounded-2xl p-5 flex items-center justify-between border border-slate-100 group">
                        <div className="flex items-center gap-4 text-slate-800 font-bold"><div className="bg-white p-2 rounded-xl border border-slate-100"><History size={20} /></div>Riwayat Medis</div><ChevronRight size={20} className="text-slate-400" />
                    </button>
                    <button onClick={onLogout} className="w-full bg-[#FEE2E2]/50 rounded-2xl p-5 flex items-center justify-between border border-red-100 mt-4 group">
                        <div className="flex items-center gap-4 text-red-700 font-bold"><div className="bg-white p-2 rounded-xl border border-red-100"><LogOut size={20} /></div>Keluar Akun</div><ChevronRight size={20} className="text-red-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profil;
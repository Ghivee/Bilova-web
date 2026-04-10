import React from 'react';
import { Star, HelpCircle, Activity, Mail } from 'lucide-react';
import { Header, Button } from '../../components/UIComponents';

const Edukasi = () => {
    return (
        <div className="pb-24">
            <Header title="BILOVA" />
            <div className="px-6 mt-4 mb-6">
                <p className="text-xs font-extrabold text-[#138476] uppercase mb-2">Pusat Pengetahuan</p>
                <h2 className="text-4xl font-extrabold text-slate-800 leading-tight mb-4">Edukasi<br />Resistansi Obat.</h2>
            </div>

            <div className="px-6 space-y-8">
                <div className="bg-[#138476] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-teal-500/20">
                    <div className="relative z-10 w-2/3">
                        <div className="flex items-center gap-2 mb-3"><Star size={16} className="fill-white" /><span className="text-xs font-extrabold uppercase text-teal-100">Tantangan Hari Ini</span></div>
                        <h3 className="text-2xl font-extrabold mb-2">Kuis Harian AMR</h3>
                        <button className="bg-white text-[#138476] px-6 py-3 rounded-full font-bold text-sm shadow-md mt-4">Mulai Sekarang</button>
                    </div>
                    <HelpCircle size={140} className="absolute -right-8 -bottom-8 text-teal-600 opacity-50" />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-xl text-slate-800">Mitos & Fakta</h3></div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                        <span className="bg-[#DFF0EE] text-[#138476] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Fakta</span>
                        <h4 className="font-extrabold text-lg text-slate-800 mt-4 mb-3 w-4/5 leading-snug">Antibiotik hanya untuk bakteri, bukan virus flu.</h4>
                        <Activity size={100} className="absolute -right-6 bottom-0 text-slate-50" />
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 text-center relative mt-12 mb-4">
                    <div className="w-14 h-14 bg-[#138476] rounded-2xl flex items-center justify-center absolute -top-7 left-1/2 -translate-x-1/2 shadow-lg"><Mail color="white" size={24} /></div>
                    <h3 className="font-extrabold text-xl text-slate-800 mt-4 mb-2">Tetap Terinformasi</h3>
                    <input type="email" placeholder="Alamat email Anda" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 text-center font-medium focus:outline-none focus:border-[#138476]" />
                    <Button>Langganan Gratis</Button>
                </div>
            </div>
        </div>
    );
};

export default Edukasi;
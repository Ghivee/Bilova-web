import React, { useState } from 'react';
import { Pill, CheckCircle2, Calendar as CalendarIcon, Settings, Bell, Lightbulb } from 'lucide-react';
import { Header, Button } from '../../components/UIComponents';

const Beranda = () => {
    const [taken, setTaken] = useState(false);
    const calendarDays = [
        { day: 'SEN', date: 12, status: 'done' }, { day: 'SEL', date: 13, status: 'done' },
        { day: 'RAB', date: 14, status: 'done' }, { day: 'KAM', date: 15, status: 'today' },
        { day: 'JUM', date: 16, status: 'pending' }, { day: 'SAB', date: 17, status: 'pending' },
    ];

    return (
        <div className="pb-24">
            <Header title="BILOVA" />
            <div className="px-6 mt-2 mb-6">
                <p className="text-slate-600 font-medium text-lg">Halo, Budi</p>
                <h2 className="text-2xl font-extrabold text-slate-800">Kesehatan Anda Hari Ini</h2>
            </div>

            <div className="px-6 mb-8">
                <div className="bg-white rounded-[2rem] p-6 shadow-md shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="bg-[#DFF0EE] text-[#138476] text-xs font-extrabold px-3 py-1 rounded-full uppercase">Dosis Berikutnya</span>
                            <h3 className="text-2xl font-extrabold text-slate-800 mt-3 mb-1">Amoxicillin 500mg</h3>
                            <div className="flex items-center gap-2 text-slate-600 font-medium"><CalendarIcon size={16} /><span>Pukul 14:00 (3 Jam lagi)</span></div>
                        </div>
                        <div className="bg-slate-100 p-3 rounded-2xl"><Pill size={28} className="text-[#138476]" /></div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 flex justify-between mb-6 border border-slate-100">
                        <div><p className="text-xs font-bold text-slate-500 uppercase mb-1">Instruksi</p><p className="font-semibold text-slate-800">Sesudah makan</p></div>
                        <div className="text-right"><p className="text-xs font-bold text-slate-500 uppercase mb-1">Sisa</p><p className="font-semibold text-[#138476]">12 Tablet</p></div>
                    </div>
                    <Button onClick={() => setTaken(true)} variant={taken ? "secondary" : "primary"} className={taken ? "bg-slate-100 text-slate-500" : ""}>
                        {taken ? "Sudah Diminum" : <><CheckCircle2 size={20} /> Konfirmasi Minum</>}
                    </Button>
                </div>
            </div>

            <div className="px-6 mb-8">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-lg text-slate-800">Kalender Mingguan</h3><span className="text-sm font-semibold text-[#138476]">Hari ke 4 dari 7</span>
                </div>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {calendarDays.map((item, idx) => (
                        <div key={idx} className={`flex-shrink-0 w-16 h-24 rounded-full flex flex-col items-center justify-center gap-1 border-2 transition-all ${item.status === 'today' ? 'bg-[#138476] border-[#138476] shadow-lg shadow-teal-500/30' : item.status === 'done' ? 'bg-[#DFF0EE] border-[#DFF0EE]' : 'bg-slate-50 border-slate-100'}`}>
                            <span className={`text-xs font-bold ${item.status === 'today' ? 'text-teal-100' : 'text-slate-500'}`}>{item.day}</span>
                            <span className={`text-xl font-extrabold ${item.status === 'today' ? 'text-white' : 'text-slate-800'}`}>{item.date}</span>
                            <div className="mt-1 h-5 flex items-center justify-center">
                                {item.status === 'done' && <CheckCircle2 size={16} className="text-[#138476]" />}
                                {item.status === 'today' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                {item.status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-6 space-y-4">
                <div className="bg-[#DFF0EE] rounded-3xl p-5 flex items-center justify-between relative overflow-hidden">
                    <div className="z-10 w-2/3">
                        <h4 className="font-bold text-slate-800 text-lg mb-1">Kepatuhan Sangat Baik!</h4>
                        <p className="text-sm text-slate-600 font-medium">Anda telah meminum 9/21 dosis tepat waktu. Pertahankan!</p>
                    </div>
                    <div className="z-10 w-16 h-16 bg-[#138476] rounded-full flex items-center justify-center shadow-lg text-white font-bold text-xl">43%</div>
                    <Settings size={120} className="absolute -right-10 -bottom-10 text-teal-600/10" />
                </div>
            </div>
        </div>
    );
};

export default Beranda;
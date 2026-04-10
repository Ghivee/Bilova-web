import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Header, Button } from '../../components/UIComponents';

const Gejala = () => {
    const [sliderVal, setSliderVal] = useState(7);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);

    const symptoms = [
        { id: 'sakit_kepala', label: 'Sakit Kepala', sub: 'Intensitas Sedang', icon: Activity },
        { id: 'mual', label: 'Mual', sub: 'Pilih jika dirasakan', icon: AlertTriangle },
        { id: 'diare', label: 'Diare', sub: 'Pilih jika dirasakan', icon: Activity },
        { id: 'lelah', label: 'Lelah', sub: 'Sangat Parah', icon: ShieldAlert, isSevere: true },
        { id: 'ruam', label: 'Ruam Kulit', sub: 'Pilih jika kemerahan', icon: Activity, full: true }
    ];

    const toggleSymptom = (id) => setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    const hasSevere = selectedSymptoms.some(id => symptoms.find(s => s.id === id)?.isSevere);

    return (
        <div className="pb-24">
            <Header title="BILOVA" />
            <div className="px-6 mt-4 mb-6">
                <h2 className="text-3xl font-extrabold text-slate-800 leading-tight mb-3">Bagaimana <span className="text-[#138476]">kondisi</span><br />Anda?</h2>
            </div>

            <div className="px-6 space-y-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-8 text-center">Kondisi Keseluruhan (1-10)</h3>
                    <div className="relative mb-6">
                        <div className="absolute w-full top-1/2 -translate-y-1/2 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#138476]" style={{ width: `${(sliderVal / 10) * 100}%` }}></div>
                        </div>
                        <input type="range" min="1" max="10" value={sliderVal} onChange={(e) => setSliderVal(parseInt(e.target.value))} className="w-full relative z-10 opacity-0 cursor-pointer" />
                        <div className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-[#138476] rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg pointer-events-none transition-all" style={{ left: `calc(${(sliderVal / 10) * 100}% - 24px)` }}>{sliderVal}</div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Efek Samping Umum</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {symptoms.map((symp) => (
                            <button key={symp.id} onClick={() => toggleSymptom(symp.id)} className={`text-left p-4 rounded-2xl border-2 transition-all ${symp.full ? 'col-span-2 flex items-center gap-4' : 'col-span-1'} ${selectedSymptoms.includes(symp.id) ? (symp.isSevere ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-[#138476] shadow-md shadow-teal-500/10') : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}>
                                {!symp.full && <symp.icon size={24} className={`mb-3 ${selectedSymptoms.includes(symp.id) ? (symp.isSevere ? 'text-red-500' : 'text-[#138476]') : 'text-slate-400'}`} />}
                                <div><h4 className={`font-bold ${selectedSymptoms.includes(symp.id) ? (symp.isSevere ? 'text-red-700' : 'text-slate-800') : 'text-slate-700'}`}>{symp.label}</h4></div>
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {hasSevere && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#FEE2E2] border border-red-200 rounded-3xl p-5">
                            <div className="flex gap-3 mb-2"><AlertTriangle className="text-red-600 mt-0.5" size={20} /><h4 className="font-bold text-red-800">Peringatan Gejala Berat</h4></div>
                            <p className="text-sm text-red-700 font-medium pl-8">Segera hubungi dokter Anda melalui tombol konsultasi.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button>Simpan Gejala</Button>
            </div>
        </div>
    );
};

export default Gejala;
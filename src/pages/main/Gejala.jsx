import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, ShieldAlert, Send, CheckCircle2 } from 'lucide-react';
import { Header, Button } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Gejala = () => {
    const { profile } = useAuth();
    const [sliderVal, setSliderVal] = useState(5);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [notes, setNotes] = useState('');
    const [medications, setMedications] = useState([]);
    const [selectedMedId, setSelectedMedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [history, setHistory] = useState([]);

    const symptoms = [
        { id: 'sakit_kepala', label: 'Sakit Kepala', icon: Brain },
        { id: 'mual', label: 'Mual', icon: AlertTriangle },
        { id: 'diare', label: 'Diare', icon: Activity },
        { id: 'lelah', label: 'Kelelahan', icon: ShieldAlert },
        { id: 'ruam', label: 'Ruam Kulit', icon: Activity },
        { id: 'pusing', label: 'Pusing', icon: Activity },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [medRes, histRes] = await Promise.all([
                supabase.from('medications').select('id, name, dosage').eq('is_active', true),
                supabase.from('symptom_logs').select('*').order('created_at', { ascending: false }).limit(5)
            ]);
            if (medRes.data) setMedications(medRes.data);
            if (histRes.data) setHistory(histRes.data);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const toggleSymptom = (id) => {
        setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const hasSevere = selectedSymptoms.some(id => symptoms.find(s => s.id === id)?.isSevere);

    const handleSubmit = async () => {
        if (selectedSymptoms.length === 0) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('symptom_logs').insert({
                user_id: profile.id,
                medication_id: selectedMedId || null,
                symptoms: selectedSymptoms,
                severity: sliderVal,
                notes: notes
            });
            if (error) throw error;

            setSuccess(true);
            setSelectedSymptoms([]);
            setSliderVal(5);
            setNotes('');
            setSelectedMedId('');
            fetchData();

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving symptoms:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24">
            <Header title="Gejala" />
            <div className="px-6 mt-2 mb-6">
                <h2 className="text-3xl font-extrabold text-slate-800 leading-tight mb-1">
                    Bagaimana <span className="text-[#138476]">kondisi</span>
                </h2>
                <h2 className="text-3xl font-extrabold text-slate-800 leading-tight">Anda?</h2>
            </div>

            <div className="px-6 space-y-6">
                {/* Slider Kondisi */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-2 text-center">Kondisi Keseluruhan</h3>
                    <p className="text-sm text-slate-500 text-center mb-6">1 = Sangat Buruk, 10 = Sangat Baik</p>
                    <div className="relative mb-6">
                        <div className="absolute w-full top-1/2 -translate-y-1/2 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#138476] transition-all" style={{ width: `${(sliderVal / 10) * 100}%` }} />
                        </div>
                        <input type="range" min="1" max="10" value={sliderVal} onChange={(e) => setSliderVal(parseInt(e.target.value))} className="w-full relative z-10 opacity-0 cursor-pointer" />
                        <div className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-[#138476] rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg pointer-events-none transition-all" style={{ left: `calc(${(sliderVal / 10) * 100}% - 24px)` }}>{sliderVal}</div>
                    </div>
                </div>

                {/* Pilih Obat Terkait */}
                {medications.length > 0 && (
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-3">Obat Terkait (opsional)</h3>
                        <select
                            value={selectedMedId}
                            onChange={(e) => setSelectedMedId(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:border-[#138476] focus:ring-1 focus:ring-[#138476]"
                        >
                            <option value="">-- Pilih obat --</option>
                            {medications.map((m) => (
                                <option key={m.id} value={m.id}>{m.name} {m.dosage}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Efek Samping */}
                <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Efek Samping yang Dirasakan</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {symptoms.map((symp) => (
                            <button key={symp.id} onClick={() => toggleSymptom(symp.id)} className={`text-left p-4 rounded-2xl border-2 transition-all ${selectedSymptoms.includes(symp.id)
                                ? (symp.isSevere ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-[#138476] shadow-md shadow-teal-500/10')
                                : 'bg-slate-50 border-transparent hover:bg-slate-100'
                                }`}>
                                <symp.icon size={22} className={`mb-2 ${selectedSymptoms.includes(symp.id) ? (symp.isSevere ? 'text-red-500' : 'text-[#138476]') : 'text-slate-400'}`} />
                                <h4 className={`font-bold text-sm ${selectedSymptoms.includes(symp.id) ? (symp.isSevere ? 'text-red-700' : 'text-slate-800') : 'text-slate-700'}`}>{symp.label}</h4>
                            </button>
                        ))}
                    </div>
                </div>



                {/* Catatan Tambahan */}
                <div>
                    <h3 className="font-bold text-slate-800 mb-3">Catatan Tambahan</h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Deskripsikan gejala Anda secara detail..."
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 font-medium resize-none h-24 focus:outline-none focus:border-[#138476] focus:ring-1 focus:ring-[#138476]"
                    />
                </div>

                {/* Success Message */}
                <AnimatePresence>
                    {success && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#DFF0EE] border border-[#138476]/20 rounded-2xl p-4 flex items-center gap-3">
                            <CheckCircle2 className="text-[#138476]" size={22} />
                            <p className="text-sm font-bold text-[#138476]">Gejala berhasil disimpan!</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button onClick={handleSubmit} disabled={loading || selectedSymptoms.length === 0}>
                    {loading ? 'Menyimpan...' : <><Send size={18} /> Simpan Gejala</>}
                </Button>

                {/* Riwayat Gejala */}
                {history.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-bold text-lg text-slate-800 mb-3">Riwayat Terbaru</h3>
                        <div className="space-y-3">
                            {history.map((log) => (
                                <div key={log.id} className="bg-white rounded-2xl p-4 border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-wrap gap-1">
                                            {log.symptoms?.map((s, i) => (
                                                <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium">{s}</span>
                                            ))}
                                        </div>
                                        <span className={`text-sm font-bold ${log.severity >= 7 ? 'text-emerald-600' : log.severity >= 4 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {log.severity}/10
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gejala;
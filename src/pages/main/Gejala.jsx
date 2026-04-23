import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Thermometer, Wind, Brain, Zap, Droplets, Eye, Send, CheckCircle2, Clock, BarChart2, Info, ChevronRight } from 'lucide-react';
import { Header, Button, Alert, Badge } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const SYMPTOMS = [
  { id: 'sakit_kepala', label: 'Sakit Kepala', icon: Brain },
  { id: 'mual', label: 'Mual / Muntah', icon: Droplets },
  { id: 'diare', label: 'Diare', icon: Wind },
  { id: 'lelah', label: 'Kelelahan', icon: Zap },
  { id: 'pusing', label: 'Pusing', icon: Eye },
  { id: 'ruam_kulit', label: 'Ruam Kulit', icon: AlertCircle },
  { id: 'demam_tinggi', label: 'Demam Tinggi', icon: Thermometer },
  { id: 'sesak_napas', label: 'Sesak Napas', icon: Wind },
  { id: 'bengkak_wajah', label: 'Bengkak Wajah', icon: AlertCircle },
];

const SEVERITY_TEXT = ['', 'Sangat Buruk', 'Buruk Sekali', 'Cukup Buruk', 'Tidak Nyaman', 'Agak Kurang', 'Sedang', 'Cukup Baik', 'Baik', 'Sangat Baik', 'Sempurna'];
const severityColor = v => v <= 3 ? '#DC2626' : v <= 6 ? '#F59E0B' : '#0284c7';

const Gejala = () => {
  const { profile } = useAuth();
  const [sliderVal, setSliderVal] = useState(7);
  const [selected, setSelected] = useState([]);
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    setError('');
    try {
      const [medRes, histRes] = await Promise.all([
        supabase.from('medications').select('id, name, dosage').eq('is_active', true).eq('user_id', profile.id),
        supabase.from('symptom_logs').select('*, medications(name,dosage)').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(10)
      ]);
      if (medRes.error) throw new Error('Gagal memuat data gummy: ' + medRes.error.message);
      if (histRes.error) throw new Error('Gagal memuat riwayat: ' + histRes.error.message);
      setMedications(medRes.data || []);
      setHistory(histRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setPageLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleSym = (id) => setSelected(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  const handleSubmit = async () => {
    if (!profile?.id) { setError('Sesi berakhir. Silakan masuk kembali.'); return; }
    setLoading(true); setError('');
    try {
      const { error: insertErr } = await supabase.from('symptom_logs').insert({
        user_id: profile.id,
        medication_id: selectedMedId || null,
        symptoms: selected,
        severity: sliderVal,
        notes: notes.trim(),
        created_at: new Date().toISOString()
      });
      if (insertErr) throw new Error('Gagal menyimpan gejala: ' + insertErr.message);
      setSuccess(true);
      setSelected([]); setSliderVal(7); setNotes(''); setSelectedMedId('');
      await fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  if (pageLoading) return (
    <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <Header title="Jurnal Kondisi" />
      <div className="px-5 pt-4 pb-20 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Bagaimana kondisi<br /><span className="text-sky-600">si kecil hari ini?</span></h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Catatan rutin membantu NutriSea memberikan intervensi gizi terbaik.</p>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message="✅ Jurnal kondisi berhasil disimpan!" />}

        {/* Kondisi umum slider */}
        <div className="bg-white rounded-3xl p-6 border-2 border-sky-50 shadow-nutrisea-sm relative overflow-hidden">
           <div className="absolute right-0 top-0 w-24 h-24 bg-sky-50 rounded-bl-full -z-0 opacity-50" />
           <div className="relative z-10">
              <h3 className="font-black text-slate-900 text-sm mb-1 uppercase tracking-wider">Rating Kondisi Umum</h3>
              <p className="text-[10px] text-slate-400 font-bold mb-8 uppercase tracking-widest">Geser: 1 (Buruk) · 10 (Sempurna)</p>

              <div className="relative mb-8 px-2">
                <div className="h-2.5 bg-sky-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(sliderVal/10)*100}%`, background: severityColor(sliderVal) }} />
                </div>
                <input type="range" min="1" max="10" value={sliderVal}
                  onChange={e => setSliderVal(parseInt(e.target.value))}
                  className="absolute inset-x-0 -top-1 w-full opacity-0 cursor-pointer h-6"
                  style={{ zIndex: 10 }}
                />
                <div className="absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl border-4 border-white shadow-nutrisea flex items-center justify-center font-black text-white text-base pointer-events-none transition-all duration-300"
                  style={{ left: `calc(${(sliderVal/10)*100}% - 22px)`, background: severityColor(sliderVal), zIndex: 5 }}>
                  {sliderVal}
                </div>
              </div>
              <p className="text-center text-sm font-black uppercase tracking-widest mt-2" style={{ color: severityColor(sliderVal) }}>{SEVERITY_TEXT[sliderVal]}</p>
           </div>
        </div>

        {/* Gummy selector */}
        {medications.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border-2 border-sky-50 shadow-nutrisea-sm">
            <h3 className="font-black text-slate-900 text-xs mb-3 uppercase tracking-wider">Terkait Gummy <span className="text-slate-400 lowercase">(Opsional)</span></h3>
            <select value={selectedMedId} onChange={e => setSelectedMedId(e.target.value)}
              className="w-full bg-sky-50 border-2 border-sky-100 rounded-2xl px-4 py-3.5 text-slate-900 font-bold text-sm focus:outline-none focus:border-sky-600 shadow-sm transition-all">
              <option value="">-- Pilih Gummy --</option>
              {medications.map(m => <option key={m.id} value={m.id}>{m.name} ({m.dosage})</option>)}
            </select>
          </div>
        )}

        {/* Symptoms */}
        <div>
          <h3 className="font-black text-slate-900 text-xs mb-3 uppercase tracking-wider ml-1">Gejala yang Dirasakan</h3>
          <div className="grid grid-cols-2 gap-3">
            {SYMPTOMS.map(s => {
              const isSelected = selected.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleSym(s.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-sky-600 border-sky-600 shadow-nutrisea text-white'
                      : 'bg-white border-sky-50 hover:border-sky-200 text-slate-600 shadow-sm'
                  }`}>
                  <s.icon size={20} className={isSelected ? 'text-white' : 'text-sky-400'} />
                  <p className="font-black text-[11px] leading-tight uppercase tracking-wide">{s.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-3xl p-6 border-2 border-sky-50 shadow-nutrisea-sm">
          <h3 className="font-black text-slate-900 text-xs mb-3 uppercase tracking-wider">Catatan Tambahan</h3>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Jelaskan kondisi si kecil lebih detail..."
            className="w-full bg-sky-50 border-2 border-sky-100 rounded-2xl px-4 py-4 text-slate-900 font-semibold text-sm resize-none h-28 focus:outline-none focus:border-sky-600 transition-all shadow-sm"
          />
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full py-4 !rounded-2xl shadow-nutrisea">
          {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            : <><Send size={18} className="mr-2"/>Simpan ke Jurnal</>}
        </Button>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 flex items-center gap-2 ml-1">
              <BarChart2 size={18} className="text-sky-600" /> Riwayat Gejala
            </h3>
            <div className="space-y-3">
              {history.map(log => (
                <div key={log.id} className="bg-white rounded-3xl p-5 border border-sky-50 shadow-nutrisea-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {log.symptoms?.length > 0 ? log.symptoms.map((s, i) => (
                        <span key={i} className="bg-sky-50 text-sky-600 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-sky-100">
                          {SYMPTOMS.find(sym => sym.id === s)?.label || s}
                        </span>
                      )) : <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Hanya update kondisi</span>}
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-4">
                       <span className="font-black text-xl leading-none" style={{ color: severityColor(log.severity) }}>{log.severity}/10</span>
                       <span className="text-[8px] font-black uppercase text-slate-300 tracking-tighter mt-1">KONDISI</span>
                    </div>
                  </div>
                  {log.notes && <p className="text-xs font-semibold text-slate-500 bg-sky-50/50 p-3 rounded-2xl italic leading-relaxed border border-sky-50 mb-3 block">"{log.notes}"</p>}
                  <div className="flex items-center justify-between border-t border-sky-50 pt-3">
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={12} />
                        {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                     </p>
                     <ChevronRight size={14} className="text-slate-200" />
                  </div>
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
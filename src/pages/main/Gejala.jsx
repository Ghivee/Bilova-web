import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Thermometer, Wind, Brain, Zap, Droplets, Eye, Send, CheckCircle2, Clock, BarChart2, Info } from 'lucide-react';
import { Header, Button, Alert } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

/*
  Gejala berat (isSevere=true): Ruam kulit, Demam tinggi, Sesak napas, Reaksi alergi parah
  → Menurut CDC/WHO, ini merupakan tanda reaksi alergi antibiotik serius yang memerlukan penanganan segera.
  → Jika severity <= 4 DAN ada gejala berat → tampilkan alert emergency.
*/
const SYMPTOMS = [
  { id: 'sakit_kepala', label: 'Sakit Kepala', icon: Brain, severe: false },
  { id: 'mual', label: 'Mual / Muntah', icon: Droplets, severe: false },
  { id: 'diare', label: 'Diare', icon: Wind, severe: false },
  { id: 'lelah', label: 'Kelelahan', icon: Zap, severe: false },
  { id: 'pusing', label: 'Pusing', icon: Eye, severe: false },
  { id: 'ruam_kulit', label: 'Ruam Kulit', icon: AlertCircle, severe: true },
  { id: 'demam_tinggi', label: 'Demam Tinggi (>38.5°C)', icon: Thermometer, severe: true },
  { id: 'sesak_napas', label: 'Sesak Napas', icon: Wind, severe: true },
  { id: 'bengkak_wajah', label: 'Bengkak Wajah/Tenggorokan', icon: AlertCircle, severe: true },
];

const SEVERITY_TEXT = ['', 'Sangat Buruk', 'Buruk Sekali', 'Cukup Buruk', 'Tidak Nyaman', 'Agak Kurang', 'Sedang', 'Cukup Baik', 'Baik', 'Sangat Baik', 'Sempurna'];
const severityColor = v => v <= 3 ? '#DC2626' : v <= 6 ? '#D97706' : '#8B2C8C';

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
        supabase.from('symptom_logs').select('*, medications(name,dosage)').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5)
      ]);
      if (medRes.error) throw new Error('Gagal memuat data obat: ' + medRes.error.message);
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

  // Determine if emergency: has severe symptoms AND felt condition is bad (slider <= 4)
  const hasSevere = selected.some(id => SYMPTOMS.find(s => s.id === id)?.severe);
  const isEmergency = hasSevere && sliderVal <= 4;

  const handleSubmit = async () => {
    if (!selected.length) { setError('Pilih minimal satu gejala yang dirasakan.'); return; }
    if (!profile?.id) { setError('Sesi berakhir. Silakan masuk kembali.'); return; }
    setLoading(true); setError('');
    try {
      // Determine severity level for medical classification
      const medicalSeverity = isEmergency ? 'emergency' : hasSevere ? 'warning' : 'normal';
      const { error: insertErr } = await supabase.from('symptom_logs').insert({
        user_id: profile.id,
        medication_id: selectedMedId || null,
        symptoms: selected,
        severity: sliderVal,
        notes: `[${medicalSeverity.toUpperCase()}] ${notes}`.trim()
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
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#EDD9F5] border-t-[#8B2C8C] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[#8B2C8C] font-bold text-sm">Memuat data...</p>
      </div>
    </div>
  );

  return (
    <div>
      <Header title="Catat Gejala" />
      <div className="px-5 pt-4 pb-8 space-y-5">
        <div>
          <h1 className="text-xl font-black text-[#2D1B3D]">Bagaimana kondisi<br /><span className="text-[#8B2C8C]">Anda hari ini?</span></h1>
          <p className="text-xs text-[#B090C0] font-semibold mt-1">Catat gejala secara rutin agar dokter dapat memantau Anda.</p>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message="✅ Gejala berhasil disimpan!" />}

        {/* Emergency Alert */}
        {isEmergency && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-red-700 text-sm mb-1">⚠️ Gejala Darurat Terdeteksi</p>
              <p className="text-red-600 text-xs font-semibold">Anda menunjukkan gejala reaksi alergi antibiotik yang serius. Segera hubungi dokter atau kunjungi IGD terdekat.</p>
              <a href="tel:119" className="inline-flex items-center gap-1 mt-2 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full">
                📞 Hubungi 119 (Darurat)
              </a>
            </div>
          </div>
        )}

        {/* Severe symptom warning */}
        {hasSevere && !isEmergency && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2">
            <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-700 text-xs font-semibold">Anda memilihkan gejala yang perlu perhatian medis. Pertimbangkan untuk segera menghubungi dokter.</p>
          </div>
        )}

        {/* Kondisi umum slider */}
        <div className="bg-white rounded-3xl p-5 border border-[#EDD9F5] shadow-card">
          <h3 className="font-black text-[#2D1B3D] mb-1">Kondisi Umum</h3>
          <p className="text-xs text-[#B090C0] font-semibold mb-4">Geser untuk menilai kondisi (1=Sangat Buruk · 10=Sempurna)</p>
          <div className="relative mb-2">
            <div className="h-2 bg-[#EDD9F5] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${(sliderVal/10)*100}%`, background: severityColor(sliderVal) }} />
            </div>
            <input type="range" min="1" max="10" value={sliderVal}
              onChange={e => setSliderVal(parseInt(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
              style={{ zIndex: 10 }}
            />
            <div className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 border-white shadow-bilova-sm flex items-center justify-center font-black text-white text-base pointer-events-none transition-all"
              style={{ left: `calc(${(sliderVal/10)*100}% - 20px)`, background: severityColor(sliderVal), zIndex: 5 }}>
              {sliderVal}
            </div>
          </div>
          <p className="text-center text-sm font-bold mt-6" style={{ color: severityColor(sliderVal) }}>{SEVERITY_TEXT[sliderVal]}</p>
        </div>

        {/* Obat terkait */}
        {medications.length > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-[#EDD9F5] shadow-card">
            <h3 className="font-black text-[#2D1B3D] mb-3">Obat yang Dikonsumsi <span className="text-[#B090C0] font-semibold text-xs">(opsional)</span></h3>
            <select value={selectedMedId} onChange={e => setSelectedMedId(e.target.value)}
              className="w-full bg-[#FCF7FF] border-2 border-[#EDD9F5] rounded-2xl px-4 py-3 text-[#2D1B3D] font-semibold text-sm focus:outline-none focus:border-[#8B2C8C]">
              <option value="">-- Pilih obat (opsional) --</option>
              {medications.map(m => <option key={m.id} value={m.id}>{m.name} {m.dosage}</option>)}
            </select>
          </div>
        )}

        {/* Symptom grid */}
        <div>
          <h3 className="font-black text-[#2D1B3D] mb-3">Gejala yang Dirasakan</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {SYMPTOMS.map(s => {
              const isSelected = selected.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleSym(s.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? s.severe ? 'bg-red-50 border-red-300' : 'bg-[#EDD9F5] border-[#8B2C8C] shadow-bilova-sm'
                      : 'bg-white border-[#EDD9F5] hover:bg-[#EDD9F5]/50 hover:border-[#D4A8E0]'
                  }`}>
                  <s.icon size={20} className={`mb-2 ${isSelected ? (s.severe ? 'text-red-500' : 'text-[#8B2C8C]') : 'text-[#D4A8E0]'}`} />
                  <p className={`font-bold text-xs ${isSelected ? (s.severe ? 'text-red-700' : 'text-[#8B2C8C]') : 'text-[#6B4B7B]'}`}>{s.label}</p>
                  {s.severe && <p className="text-[9px] font-black text-red-400 uppercase mt-0.5">Perlu Perhatian</p>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Catatan */}
        <div>
          <h3 className="font-black text-[#2D1B3D] mb-2">Catatan Tambahan</h3>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Jelaskan gejala secara detail untuk membantu dokter memantau kondisi Anda..."
            className="w-full bg-white border-2 border-[#EDD9F5] rounded-2xl px-4 py-3 text-[#2D1B3D] font-semibold text-sm resize-none h-24 focus:outline-none focus:border-[#8B2C8C] transition"
          />
        </div>

        <Button onClick={handleSubmit} disabled={loading || !selected.length}>
          {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Menyimpan...</>
            : <><Send size={16} />Simpan Gejala</>}
        </Button>

        {/* Riwayat */}
        {history.length > 0 && (
          <div>
            <h3 className="font-black text-[#2D1B3D] mb-3 flex items-center gap-2">
              <BarChart2 size={16} className="text-[#8B2C8C]" /> Riwayat Terbaru
            </h3>
            <div className="space-y-2">
              {history.map(log => {
                const noteStr = log.notes || '';
                const isEmerg = noteStr.includes('[EMERGENCY]');
                const isWarn = noteStr.includes('[WARNING]');
                return (
                  <div key={log.id} className={`bg-white rounded-2xl p-4 border-2 ${isEmerg ? 'border-red-200' : isWarn ? 'border-amber-200' : 'border-[#EDD9F5]'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {log.symptoms?.slice(0, 3).map((s, i) => (
                          <span key={i} className="bg-[#EDD9F5] text-[#8B2C8C] text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {SYMPTOMS.find(sym => sym.id === s)?.label || s}
                          </span>
                        ))}
                        {log.symptoms?.length > 3 && <span className="text-xs text-[#B090C0] font-bold">+{log.symptoms.length - 3}</span>}
                      </div>
                      <span className="font-black text-lg ml-2 shrink-0" style={{ color: severityColor(log.severity) }}>
                        {log.severity}/10
                      </span>
                    </div>
                    {isEmerg && <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">DARURAT</span>}
                    {isWarn && !isEmerg && <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">PERHATIAN</span>}
                    <p className="text-[10px] text-[#B090C0] font-bold mt-1.5 flex items-center gap-1">
                      <Clock size={9} />
                      {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gejala;
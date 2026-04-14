import React, { useState, useEffect, useCallback } from 'react';
import { Pill, CheckCircle2, Clock, TrendingUp, Bell, Calendar, Lightbulb, AlertTriangle } from 'lucide-react';
import { Button, SectionTitle, Alert } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import logoSrc from '../../assets/Bilova_Logo.png';

const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const Beranda = () => {
  const { profile } = useAuth();
  const [medications, setMedications] = useState([]);
  const [takenIds, setTakenIds] = useState(new Set());
  const [loadingMed, setLoadingMed] = useState(null);
  const [compliance, setCompliance] = useState(0);
  const [takenToday, setTakenToday] = useState(0);
  const [calendarDays, setCalendarDays] = useState([]);
  const [tip, setTip] = useState(null);
  const [error, setError] = useState('');

  const today = new Date();
  const firstName = profile?.full_name?.split(' ')[0] || 'Pengguna';
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

  // Build weekly calendar
  useEffect(() => {
    const start = new Date(today);
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday start
    setCalendarDays(Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        day: DAY_NAMES_SHORT[d.getDay()],
        date: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
        isPast: d < today && d.toDateString() !== today.toDateString(),
      };
    }));
  }, []);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    setError('');
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    try {
      const [medRes, logRes, tipRes] = await Promise.all([
        supabase.from('medications').select('*').eq('is_active', true).eq('user_id', profile.id).order('created_at'),
        supabase.from('compliance_logs').select('medication_id').gte('taken_at', startOfDay.toISOString()).eq('status', 'taken').eq('user_id', profile.id),
        supabase.from('daily_tips').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1).single()
      ]);
      if (medRes.error && medRes.error.code !== 'PGRST116') throw new Error('Gagal memuat jadwal obat.');
      if (medRes.data) setMedications(medRes.data);
      if (logRes.data) {
        const ids = new Set(logRes.data.map(l => l.medication_id));
        setTakenIds(ids);
        setTakenToday(ids.size);
        const total = medRes.data?.length || 0;
        setCompliance(total > 0 ? Math.round((ids.size / total) * 100) : 0);
      }
      if (tipRes.data) setTip(tipRes.data);
    } catch (err) {
      setError(err.message);
    }
  }, [profile?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConfirmMed = async (medicationId) => {
    if (!profile) return;
    setLoadingMed(medicationId);
    setError('');
    try {
      // Check if already logged today
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const { data: existing } = await supabase.from('compliance_logs')
        .select('id').eq('medication_id', medicationId).eq('user_id', profile.id)
        .gte('taken_at', startOfDay.toISOString()).limit(1);
      if (existing?.length > 0) { setError('Anda sudah mengkonfirmasi obat ini hari ini.'); return; }

      const { error: insertErr } = await supabase.from('compliance_logs').insert({
        user_id: profile.id, medication_id: medicationId,
        taken_at: new Date().toISOString(), status: 'taken'
      });
      if (insertErr) throw new Error('Gagal menyimpan konfirmasi: ' + insertErr.message);

      const med = medications.find(m => m.id === medicationId);
      if (med?.remaining_tablets > 0) {
        await supabase.from('medications').update({ remaining_tablets: med.remaining_tablets - 1 }).eq('id', medicationId);
      }
      await fetchData();
    } catch (err) { setError(err.message); } finally { setLoadingMed(null); }
  };

  const complianceColor = compliance >= 80 ? '#8B2C8C' : compliance >= 50 ? '#D97706' : '#DC2626';
  const complianceLabel = compliance >= 80 ? 'Kepatuhan Sangat Baik! 🌟' : compliance >= 50 ? 'Cukup Patuh 👍' : 'Perlu Ditingkatkan ⚠️';

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#FCF7FF]/95 backdrop-blur-md border-b border-[#EDD9F5] px-5 py-3.5 flex items-center justify-between">
        <img src={logoSrc} alt="BiLova" className="h-9 w-auto object-contain" />
        <div className="flex items-center gap-2">
          {medications.length > 0 && (
            <div className="relative">
              <Bell size={20} className="text-[#8B2C8C]" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#C85CA0] rounded-full text-[8px] text-white font-black flex items-center justify-center">
                {medications.length - takenToday}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pt-4 pb-24 lg:pb-8 space-y-5">
        {/* Greeting */}
        <div>
          <p className="text-sm text-[#B090C0] font-bold">{greeting}, {firstName} 👋</p>
          <h1 className="text-xl font-black text-[#2D1B3D]">Kesehatan Anda Hari Ini</h1>
        </div>

        {error && <Alert type="error" message={error} />}

        {/* Compliance Card */}
        <div className="bg-gradient-to-br from-[#8B2C8C] to-[#C85CA0] rounded-3xl p-5 text-white relative overflow-hidden shadow-bilova">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full" />
          <div className="absolute right-4 bottom-4 w-16 h-16 bg-white/5 rounded-full" />
          {/* Decorative pill shapes */}
          <div className="absolute top-3 right-12 opacity-20 rotate-[30deg]">
            <div className="w-8 h-4 bg-white rounded-full" />
          </div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Kepatuhan Hari Ini</p>
              <p className="text-5xl font-black">{compliance}%</p>
              <p className="text-white/80 text-sm mt-1">{takenToday} dari {medications.length} dosis diminum</p>
              <p className="text-[#EDD9F5] text-xs font-bold mt-1">{complianceLabel}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center">
              <TrendingUp size={28} />
            </div>
          </div>
        </div>

        {/* Weekly calendar */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <SectionTitle><Calendar size={14} className="inline mr-1" />Minggu Ini</SectionTitle>
            <span className="text-xs font-bold text-[#B090C0]">
              {today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {calendarDays.map((d, i) => (
              <div key={i} className={`flex-shrink-0 w-12 h-16 rounded-2xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${
                d.isToday ? 'bg-[#8B2C8C] border-[#8B2C8C] shadow-bilova-sm' :
                d.isPast ? 'bg-[#EDD9F5] border-[#D4A8E0]' : 'bg-white border-[#EDD9F5]'
              }`}>
                <span className={`text-[9px] font-black ${d.isToday ? 'text-[#EDD9F5]' : 'text-[#B090C0]'}`}>{d.day}</span>
                <span className={`text-base font-black ${d.isToday ? 'text-white' : 'text-[#2D1B3D]'}`}>{d.date}</span>
                <div className="h-2 flex items-center">
                  {d.isPast && <CheckCircle2 size={10} className="text-[#8B2C8C]" />}
                  {d.isToday && <div className="w-1.5 h-1.5 rounded-full bg-[#EDD9F5]" />}
                  {!d.isPast && !d.isToday && <div className="w-1.5 h-1.5 rounded-full bg-[#EDD9F5]" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medication schedule */}
        <div>
          <SectionTitle><Pill size={14} className="inline mr-1" />Jadwal Obat</SectionTitle>
          {medications.length > 0 ? medications.map(med => {
            const taken = takenIds.has(med.id);
            const lowStock = med.remaining_tablets <= 5;
            return (
              <div key={med.id} className={`mb-3 bg-white rounded-3xl p-5 border-2 shadow-card transition-all ${taken ? 'border-[#EDD9F5] opacity-80' : 'border-[#EDD9F5] shadow-bilova-sm'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${taken ? 'bg-[#EDD9F5] text-[#8B2C8C]' : 'bg-[#8B2C8C] text-white'}`}>
                        {taken ? '✓ Sudah Diminum' : 'Dosis Berikutnya'}
                      </span>
                      {lowStock && !taken && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                          <AlertTriangle size={8} /> Stok Menipis
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-[#2D1B3D]">{med.name} <span className="text-[#8B2C8C]">{med.dosage}</span></h3>
                    <div className="flex items-center gap-1 text-[#B090C0] text-xs mt-0.5">
                      <Clock size={11} /> <span>{med.frequency}</span>
                      {med.schedule_times?.length > 0 && <span>· {med.schedule_times.join(', ')}</span>}
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${taken ? 'bg-[#EDD9F5]' : 'bg-[#8B2C8C]'}`}>
                    {/* Pill capsule icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="9" width="20" height="6" rx="3" fill={taken ? '#8B2C8C' : 'white'} opacity="0.3"/>
                      <rect x="2" y="9" width="10" height="6" rx="3" fill={taken ? '#8B2C8C' : 'white'} opacity="0.6"/>
                      <line x1="12" y1="10" x2="12" y2="14" stroke={taken ? '#8B2C8C' : 'white'} strokeWidth="1.5" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-[#FCF7FF] rounded-2xl p-3 mb-3 border border-[#EDD9F5]">
                  <div>
                    <p className="text-[10px] font-black text-[#B090C0] uppercase mb-0.5">Instruksi</p>
                    <p className="font-bold text-[#2D1B3D] text-sm">{med.instruction || 'Lihat kemasan'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#B090C0] uppercase mb-0.5">Sisa Tablet</p>
                    <p className={`font-black text-sm ${lowStock ? 'text-amber-600' : 'text-[#8B2C8C]'}`}>{med.remaining_tablets} Tablet</p>
                  </div>
                </div>
                <Button onClick={() => handleConfirmMed(med.id)} variant={taken ? 'secondary' : 'primary'} disabled={taken || loadingMed === med.id}>
                  {loadingMed === med.id
                    ? <><span className="w-4 h-4 border-2 border-[#EDD9F5] border-t-[#8B2C8C] rounded-full animate-spin" />Menyimpan...</>
                    : taken ? '✓ Sudah Dikonfirmasi' : <><CheckCircle2 size={16} />Konfirmasi Minum</>
                  }
                </Button>
              </div>
            );
          }) : (
            <div className="bg-white rounded-3xl p-8 border border-[#EDD9F5] text-center shadow-card">
              <div className="text-5xl mb-3">💊</div>
              <p className="font-bold text-[#6B4B7B] mb-1">Belum Ada Resep Obat</p>
              <p className="text-sm text-[#B090C0]">Obat akan muncul setelah dokter/admin menginputkan resep Anda.</p>
            </div>
          )}
        </div>

        {/* Daily tip (from admin) */}
        {tip && (
          <div className="bg-white rounded-3xl p-5 border border-[#EDD9F5] shadow-card relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Lightbulb size={80} className="text-[#8B2C8C]" />
            </div>
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-[#EDD9F5] flex items-center justify-center shrink-0">
                <Lightbulb size={20} className="text-[#8B2C8C]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#8B2C8C] uppercase tracking-wider mb-1">Tips Hari Ini</p>
                <p className="text-sm text-[#6B4B7B] font-semibold leading-relaxed">{tip.content}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Beranda;
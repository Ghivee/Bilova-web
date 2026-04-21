import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Scale, Ruler, Send, CheckCircle2, Clock, BarChart2, TrendingUp } from 'lucide-react';
import { Header, Button, Alert } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const TumbuhKembang = () => {
  const { profile } = useAuth();
  const [tinggi, setTinggi] = useState('');
  const [berat, setBerat] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    setError('');
    try {
      const { data, error: histErr } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', profile.id)
        .contains('symptoms', ['tumbuh_kembang'])
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (histErr) throw new Error('Gagal memuat jurnal: ' + histErr.message);
      setHistory(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setPageLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!tinggi || !berat) { setError('Masukkan tinggi dan berat badan anak.'); return; }
    if (!profile?.id) { setError('Sesi berakhir. Silakan masuk kembali.'); return; }
    setLoading(true); setError('');
    try {
      const { error: insertErr } = await supabase.from('symptom_logs').insert({
        user_id: profile.id,
        medication_id: null,
        symptoms: ['tumbuh_kembang'],
        severity: 10,
        notes: `TB: ${tinggi} cm | BB: ${berat} kg${notes ? ` | Catatan: ${notes}` : ''}`
      });
      if (insertErr) throw new Error('Gagal menyimpan jurnal: ' + insertErr.message);
      setSuccess(true);
      setTinggi(''); setBerat(''); setNotes('');
      await fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const parseData = (noteStr) => {
    const tbMatch = noteStr.match(/TB:\s*(\d+(\.\d+)?)\s*cm/);
    const bbMatch = noteStr.match(/BB:\s*(\d+(\.\d+)?)\s*kg/);
    return {
      tb: tbMatch ? tbMatch[1] : '-',
      bb: bbMatch ? bbMatch[1] : '-',
    };
  };

  if (pageLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sky-600 font-bold text-sm">Memuat data...</p>
      </div>
    </div>
  );

  return (
    <div>
      <Header title="Tumbuh Kembang" />
      <div className="px-5 pt-4 pb-8 space-y-5">
        <div>
          <h1 className="text-xl font-black text-slate-900">Jurnal<br /><span className="text-sky-600">KIA Digital</span></h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Pantau tinggi & berat badan si Kecil setiap bulan secara rutin.</p>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message="✅ Data berhasil disimpan!" />}

        {/* Form Input */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className="text-sky-600" />
            <h3 className="font-black text-slate-900">Catat Pertumbuhan</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-1">
                <Ruler size={14} className="text-sky-600"/> Tinggi Badan
              </label>
              <div className="relative">
                <input type="number" value={tinggi} onChange={e => setTinggi(e.target.value)}
                  placeholder="Contoh: 85"
                  className="w-full bg-sky-50 border-2 border-sky-100 rounded-2xl pl-4 pr-10 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-sky-600 transition" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">cm</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-1">
                <Scale size={14} className="text-sky-600"/> Berat Badan
              </label>
              <div className="relative">
                <input type="number" value={berat} onChange={e => setBerat(e.target.value)}
                  placeholder="Contoh: 12.5" step="0.1"
                  className="w-full bg-sky-50 border-2 border-sky-100 rounded-2xl pl-4 pr-10 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-sky-600 transition" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kg</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Catatan Opsional</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Misal: Lingkar kepala normal, anak mulai aktif berjalan"
              className="w-full bg-white border-2 border-sky-100 rounded-2xl px-4 py-3 text-slate-900 font-semibold text-sm resize-none h-20 focus:outline-none focus:border-sky-600 transition"
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full justify-center">
            {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />Menyimpan...</>
              : <><Send size={16} className="mr-2"/>Simpan Data</>}
          </Button>
        </div>

        {/* Riwayat */}
        {history.length > 0 && (
          <div>
            <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2">
              <BarChart2 size={16} className="text-sky-600" /> Grafik & Riwayat
            </h3>
            
            {/* Simple Graphic Bar placeholder */}
            <div className="bg-gradient-to-r from-sky-600 to-cyan-500 rounded-3xl p-5 text-white mb-4 shadow-nutrisea relative overflow-hidden">
               <div className="absolute right-0 top-0 opacity-20">
                  <TrendingUp size={100} />
               </div>
               <p className="text-sky-100 text-xs font-bold uppercase mb-1 z-10 relative">Status Terakhir</p>
               <div className="flex justify-between items-end z-10 relative">
                  <div>
                    <span className="text-3xl font-black">{parseData(history[0].notes).tb}</span> <span className="text-sm">cm</span>
                  </div>
                  <div className="h-8 w-px bg-white/30 mx-4"></div>
                  <div>
                    <span className="text-3xl font-black">{parseData(history[0].notes).bb}</span> <span className="text-sm">kg</span>
                  </div>
               </div>
            </div>

            <div className="space-y-3">
              {history.map((log) => {
                const { tb, bb } = parseData(log.notes);
                // remove TB/BB info from notes string to print the actual user note
                const noteDetailsMatch = log.notes.match(/Catatan:\s*(.*)/);
                const actualNote = noteDetailsMatch ? noteDetailsMatch[1] : '';
                return (
                  <div key={log.id} className="bg-white rounded-2xl p-4 border border-sky-100 shadow-card">
                    <div className="flex justify-between items-center mb-2 border-b border-sky-50 pb-2">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-black text-slate-400">Tinggi</p>
                          <p className="font-black text-slate-900">{tb} <span className="text-xs font-bold text-slate-500">cm</span></p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-black text-slate-400">Berat</p>
                          <p className="font-black text-slate-900">{bb} <span className="text-xs font-bold text-slate-500">kg</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold flex items-center justify-end gap-1">
                          <Clock size={10} />
                          {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    {actualNote && <p className="text-xs font-semibold text-slate-600 bg-sky-50 p-2 rounded-lg inline-block">" {actualNote} "</p>}
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

export default TumbuhKembang;

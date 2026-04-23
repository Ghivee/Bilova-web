import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Scale, Ruler, Send, CheckCircle2, Clock, BarChart2, TrendingUp, Info } from 'lucide-react';
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
        .order('created_at', { ascending: false });
        
      if (histErr) throw new Error('Gagal memuat jurnal: ' + histErr.message);
      // Filter for logs with height/weight or "tumbuh_kembang" tag
      const filtered = data?.filter(l => l.height || l.weight || l.symptoms?.includes('tumbuh_kembang')) || [];
      setHistory(filtered);
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
        symptoms: ['tumbuh_kembang'],
        severity: 10,
        height: parseFloat(tinggi),
        weight: parseFloat(berat),
        notes: notes.trim()
      });
      if (insertErr) throw new Error('Gagal menyimpan jurnal: ' + insertErr.message);
      setSuccess(true);
      setTinggi(''); setBerat(''); setNotes('');
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
      <Header title="Tumbuh Kembang" />
      <div className="px-5 pt-4 pb-12 space-y-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Jurnal <span className="text-sky-600">KIA Digital</span></h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Pantau tinggi & berat badan si kecil secara rutin setiap bulan.</p>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message="✅ Data pertumbuhan berhasil disimpan!" />}

        {/* Input Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-sky-50 shadow-nutrisea-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600">
               <Activity size={20} />
            </div>
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs">Catat Pertumbuhan Baru</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tinggi Badan</label>
              <div className="relative">
                <input type="number" value={tinggi} onChange={e => setTinggi(e.target.value)}
                  placeholder="0.0" step="0.1"
                  className="w-full bg-sky-50/50 border-2 border-sky-100 rounded-2xl pl-4 pr-12 py-3.5 text-slate-900 font-black text-lg focus:outline-none focus:border-sky-600 transition-all shadow-sm" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-sky-400">cm</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Berat Badan</label>
              <div className="relative">
                <input type="number" value={berat} onChange={e => setBerat(e.target.value)}
                  placeholder="0.0" step="0.1"
                  className="w-full bg-sky-50/50 border-2 border-sky-100 rounded-2xl pl-4 pr-12 py-3.5 text-slate-900 font-black text-lg focus:outline-none focus:border-sky-600 transition-all shadow-sm" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-sky-400">kg</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Catatan Bunda</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Misal: Si kecil mulai belajar merangkak..."
              className="w-full bg-white border-2 border-sky-100 rounded-2xl px-4 py-3 text-slate-900 font-semibold text-sm resize-none h-20 focus:outline-none focus:border-sky-600 transition"
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full py-4 !rounded-2xl shadow-nutrisea">
            {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              : <><Send size={18} className="mr-2"/>Simpan ke Jurnal</>}
          </Button>
        </div>

        {/* Stats Summary */}
        {history.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                   <BarChart2 size={18} className="text-sky-600" /> Riwayat Pertumbuhan
                </h3>
             </div>

             {/* Goal/Latest Card */}
             <div className="bg-gradient-to-br from-sky-600 to-cyan-500 rounded-3xl p-6 text-white shadow-nutrisea relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                   <TrendingUp size={140} />
                </div>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-3 relative z-10">Data Terakhir ({new Date(history[0].created_at).toLocaleDateString('id-ID', { month: 'long' })})</p>
                <div className="flex items-center gap-8 relative z-10">
                   <div>
                      <p className="text-4xl font-black">{history[0].height || '-'}<span className="text-sm font-bold opacity-70 ml-1">cm</span></p>
                      <p className="text-[10px] font-bold text-sky-100 opacity-60">Tinggi Badan</p>
                   </div>
                   <div className="w-px h-10 bg-white/20"></div>
                   <div>
                      <p className="text-4xl font-black">{history[0].weight || '-'}<span className="text-sm font-bold opacity-70 ml-1">kg</span></p>
                      <p className="text-[10px] font-bold text-sky-100 opacity-60">Berat Badan</p>
                   </div>
                </div>
             </div>

             <div className="space-y-3">
                {history.slice(0, 5).map((log) => (
                   <div key={log.id} className="bg-white rounded-3xl p-5 border border-sky-50 shadow-nutrisea-sm group">
                      <div className="flex justify-between items-center mb-3">
                         <div className="flex items-center gap-2 text-sky-600 font-black text-xs uppercase tracking-widest px-3 py-1 bg-sky-50 rounded-full">
                            <Clock size={12} /> {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                         </div>
                         <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <Info size={14} />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 border-b border-sky-50 pb-3 mb-3">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                               <Ruler size={16} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase">Tinggi</p>
                               <p className="font-black text-slate-900">{log.height || '-'} <span className="text-[9px] text-slate-400">cm</span></p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                               <Scale size={16} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase">Berat</p>
                               <p className="font-black text-slate-900">{log.weight || '-'} <span className="text-[9px] text-slate-400">kg</span></p>
                            </div>
                         </div>
                      </div>
                      {log.notes && (
                         <div className="flex items-start gap-2">
                            <span className="text-sky-300 mt-0.5">💬</span>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed italic">{log.notes}</p>
                         </div>
                      )}
                   </div>
                ))}
             </div>
          </div>
        )}

        {history.length === 0 && (
           <div className="bg-sky-50/50 rounded-3xl p-12 text-center border-2 border-dashed border-sky-100 opacity-60">
              <Scale size={40} className="text-sky-200 mx-auto mb-3" />
              <p className="text-sm font-black text-sky-400 uppercase tracking-widest leading-tight">Belum ada riwayat<br/>tumbuh kembang</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default TumbuhKembang;

import React, { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, Clock, BarChart2, AlertTriangle, Map, ShieldCheck, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Alert, Badge, CircularProgress } from '../../components/UIComponents';

const MOCK_REGIONS = [
  { id: 'RT01', name: 'RT 01 / RW 05', comp: 85 },
  { id: 'RT02', name: 'RT 02 / RW 05', comp: 60 },
  { id: 'RT03', name: 'RT 03 / RW 05', comp: 92 },
  { id: 'RT04', name: 'RT 04 / RW 05', comp: 40 },
  { id: 'RT05', name: 'RT 05 / RW 05', comp: 75 },
  { id: 'RT06', name: 'RT 06 / RW 05', comp: 88 },
];

const AdminKepatuhan = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ high: 0, medium: 0, low: 0, avgOverall: 0 });
  const [sortBy, setSortBy] = useState('compliance'); // 'compliance' | 'name'
  const [sortAsc, setSortAsc] = useState(false);

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const startMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const daysIn = new Date().getDate();

      const [profilesRes, medsRes, logsRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, phone').eq('role', 'user').order('full_name'),
        supabase.from('medications').select('user_id').eq('is_active', true),
        supabase.from('compliance_logs').select('user_id, taken_at, medication_id').eq('status', 'taken').gte('taken_at', startMonth)
      ]);

      if (profilesRes.error) throw new Error('Gagal memuat data: ' + profilesRes.error.message);

      const users = profilesRes.data || [];
      const meds = medsRes.data || [];
      const logs = logsRes.data || [];

      // Build per-user stats
      const enriched = users.map(u => {
        const uMeds = meds.filter(m => m.user_id === u.id).length;
        const uLogs = logs.filter(l => l.user_id === u.id).length;
        const expected = uMeds * daysIn;
        const compliance = expected > 0 ? Math.min(Math.round((uLogs / expected) * 100), 100) : 0;
        return { ...u, compliance, taken: uLogs, expected, activeMeds: uMeds };
      });

      // Sort
      enriched.sort((a, b) => {
        if (sortBy === 'compliance') return sortAsc ? a.compliance - b.compliance : b.compliance - a.compliance;
        return sortAsc ? a.full_name?.localeCompare(b.full_name) : b.full_name?.localeCompare(a.full_name);
      });

      setPatients(enriched);

      // Summary stats
      const high = enriched.filter(p => p.compliance >= 80).length;
      const medium = enriched.filter(p => p.compliance >= 50 && p.compliance < 80).length;
      const low = enriched.filter(p => p.compliance < 50).length;
      const avgOverall = enriched.length > 0 ? Math.round(enriched.reduce((s, p) => s + p.compliance, 0) / enriched.length) : 0;
      setStats({ high, medium, low, avgOverall });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [sortBy, sortAsc]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = patients.filter(p =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const compCategory = v => v >= 80 ? { label: 'Tinggi', color: 'sky', trend: TrendingUp, tc: 'text-sky-600', bg: 'bg-sky-50', mapBg: 'bg-sky-500' }
    : v >= 50 ? { label: 'Sedang', color: 'amber', trend: Minus, tc: 'text-amber-600', bg: 'bg-amber-50', mapBg: 'bg-amber-500' }
    : { label: 'Rendah', color: 'red', trend: TrendingDown, tc: 'text-red-600', bg: 'bg-red-50', mapBg: 'bg-red-500' };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="bg-gradient-to-br from-sky-600 to-cyan-500 rounded-3xl p-8 mb-6 shadow-nutrisea text-white">
        <h3 className="text-3xl font-black tracking-tight mb-1">Analisis Kepatuhan</h3>
        <p className="text-white/80 font-semibold text-sm">Monitor kedisiplinan bunda dalam memberikan NutriSea Gummy untuk si kecil.</p>
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

      {/* Heatmap Wilayah */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 shadow-nutrisea-sm mb-6">
         <h4 className="font-black text-slate-900 mb-5 flex items-center gap-2"><Map size={20} className="text-sky-600"/> Heatmap Kedisiplinan Per Wilayah</h4>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {MOCK_REGIONS.map(r => {
               const cat = compCategory(r.comp);
               return (
                  <div key={r.id} className={`${cat.bg} rounded-2xl p-4 border border-white flex flex-col items-center justify-center text-center transition-all hover:scale-105 shadow-sm`}>
                     <div className={`w-12 h-12 rounded-full ${cat.mapBg} text-white flex items-center justify-center font-black mb-2 shadow-lg border-2 border-white`}>
                        {r.comp}%
                     </div>
                     <p className={`font-black ${cat.tc} text-[10px] uppercase tracking-wider`}>{r.name}</p>
                  </div>
               )
            })}
         </div>
         <div className="mt-5 flex flex-wrap gap-4 text-[10px] font-black justify-center border-t border-sky-50 pt-4 uppercase tracking-widest">
             <span className="flex items-center gap-1.5 text-sky-600"><div className="w-2.5 h-2.5 bg-sky-500 rounded-full shadow-sm"></div> Patuh (≥80%)</span>
             <span className="flex items-center gap-1.5 text-amber-600"><div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-sm"></div> Sedang (50-79%)</span>
             <span className="flex items-center gap-1.5 text-red-600"><div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm"></div> Rendah (&lt;50%)</span>
         </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Kepatuhan Tinggi', value: stats.high, sub: '≥ 80%', color: 'bg-sky-50', val: 'text-sky-600', icon: ShieldCheck },
          { label: 'Kepatuhan Sedang', value: stats.medium, sub: '50–79%', color: 'bg-amber-50', val: 'text-amber-600', icon: Minus },
          { label: 'Kepatuhan Rendah', value: stats.low, sub: '< 50%', color: 'bg-red-50', val: 'text-red-600', icon: AlertTriangle },
          { label: 'Rata-rata Global', value: `${stats.avgOverall}%`, sub: 'Seluruh Bunda', color: 'bg-sky-600', val: 'text-white', icon: Zap },
        ].map(s => {
           const Icon = s.icon;
           return (
            <div key={s.label} className={`${s.color} rounded-3xl p-5 text-center border ${s.val === 'text-white' ? 'border-sky-600 shadow-nutrisea' : 'border-sky-50 shadow-nutrisea-sm'}`}>
              <div className="flex justify-center mb-1"><Icon size={20} className={s.val === 'text-white' ? 'text-white/60' : 'text-slate-300'} /></div>
              <p className={`text-3xl font-black ${s.val}`}>{s.value}</p>
              <p className={`font-black text-[10px] uppercase tracking-wider mt-1 ${s.val === 'text-white' ? 'text-white/80' : 'text-slate-500'}`}>{s.label}</p>
              <p className={`text-[10px] font-bold ${s.val === 'text-white' ? 'text-white/40' : 'text-slate-300'}`}>{s.sub}</p>
            </div>
           )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-sky-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari bunda atau si kecil..."
            className="w-full bg-white border-2 border-sky-100 rounded-2xl pl-12 pr-6 py-3.5 text-slate-900 font-semibold text-sm focus:outline-none focus:border-sky-600 shadow-nutrisea-sm" />
        </div>
        <button onClick={() => { if (sortBy === 'compliance') setSortAsc(!sortAsc); else { setSortBy('compliance'); setSortAsc(false); } }}
          className={`px-6 py-3.5 rounded-2xl font-black text-sm border-2 transition-all flex items-center justify-center gap-2 ${sortBy === 'compliance' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-sky-600 border-sky-50 shadow-nutrisea-sm'}`}>
          <BarChart2 size={16} /> Filter Kepatuhan
        </button>
      </div>

      {stats.low > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-5 mb-6 flex items-start gap-4 shadow-nutrisea-sm shadow-red-100">
          <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shrink-0 shadow-lg">
             <AlertTriangle size={24} />
          </div>
          <div>
            <p className="font-black text-red-700">Terdapat {stats.low} Bunda dengan Kepatuhan Rendah</p>
            <p className="text-red-500 text-sm font-semibold">Segera tindaklanjuti untuk memastikan intervensi gizi si kecil tetap berjalan optimal.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-nutrisea">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sky-50">
              <tr>
                {['Profil Bunda', 'Gummy Aktif', 'Diminum', 'Kepatuhan %', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-black text-sky-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sky-300 font-black">Data tidak ditemukan.</td></tr>
              ) : filtered.map(p => {
                const cat = compCategory(p.compliance);
                const TrendIcon = cat.trend;
                return (
                  <tr key={p.id} className="hover:bg-sky-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 font-black text-xs group-hover:bg-sky-600 group-hover:text-white transition-all">
                          {p.full_name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{p.full_name || '-'}</p>
                          <p className="text-[10px] text-sky-400 font-bold uppercase">{p.email.split('@')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-black text-slate-900 text-sm bg-sky-50 px-3 py-1 rounded-lg border border-sky-100">{p.activeMeds} Gummy</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-slate-900 text-sm">{p.taken}</span>
                        <span className="text-[10px] text-slate-400 font-bold">/ {p.expected}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2.5 bg-sky-100 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full rounded-full transition-all duration-1000 shadow-nutrisea-sm" style={{ width: `${p.compliance}%`, background: p.compliance >= 80 ? '#0284c7' : p.compliance >= 50 ? '#d97706' : '#dc2626' }} />
                        </div>
                        <span className={`font-black text-sm ${cat.tc}`}>{p.compliance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <TrendIcon size={16} className={cat.tc} />
                        <Badge color={cat.color}>{cat.label}</Badge>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminKepatuhan;

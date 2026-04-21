import React, { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, Clock, BarChart2, AlertTriangle, Map } from 'lucide-react';
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

  const compCategory = v => v >= 80 ? { label: 'Tinggi', color: 'green', trend: TrendingUp, tc: 'text-green-600', bg: 'bg-green-100', mapBg: 'bg-green-500' }
    : v >= 50 ? { label: 'Sedang', color: 'amber', trend: Minus, tc: 'text-amber-600', bg: 'bg-amber-100', mapBg: 'bg-amber-500' }
    : { label: 'Rendah', color: 'red', trend: TrendingDown, tc: 'text-red-600', bg: 'bg-red-100', mapBg: 'bg-red-500' };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="bg-gradient-to-br from-sky-600 to-cyan-500 rounded-2xl p-8 mb-6 shadow-nutrisea text-white">
        <h3 className="text-3xl font-black text-white tracking-tight mb-1">Heatmap Kepatuhan</h3>
        <p className="text-white/80 font-semibold text-sm">Peta visual indikator kedisiplinan dan monitoring kepatuhan bulan ini.</p>
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

      {/* Heatmap Wilayah */}
      <div className="bg-white rounded-2xl border border-sky-100 p-6 shadow-card mb-6">
         <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Map size={18} className="text-sky-600"/> Peta Visual Kedisiplinan Per Wilayah</h4>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MOCK_REGIONS.map(r => {
               const cat = compCategory(r.comp);
               return (
                  <div key={r.id} className={`${cat.bg} rounded-2xl p-4 border border-white flex flex-col items-center justify-center text-center transition-transform hover:scale-105`}>
                     <div className={`w-12 h-12 rounded-full ${cat.mapBg} text-white flex items-center justify-center font-black mb-2 shadow-sm`}>
                        {r.comp}%
                     </div>
                     <p className={`font-black ${cat.tc} text-sm`}>{r.name}</p>
                  </div>
               )
            })}
         </div>
         <div className="mt-4 flex gap-4 text-xs font-bold justify-center border-t border-sky-50 pt-4">
             <span className="flex items-center gap-1 text-green-600"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Baik (≥80%)</span>
             <span className="flex items-center gap-1 text-amber-600"><div className="w-3 h-3 bg-amber-500 rounded-full"></div> Sedang (50-79%)</span>
             <span className="flex items-center gap-1 text-red-600"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Rendah (&lt;50%)</span>
         </div>
      </div>

      {/* Summary stats */}
      <h4 className="font-black text-slate-900 mb-3">Ringkasan Individu</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Kepatuhan Tinggi', value: stats.high, sub: '≥ 80%', color: 'bg-sky-50', val: 'text-sky-600' },
          { label: 'Kepatuhan Sedang', value: stats.medium, sub: '50–79%', color: 'bg-amber-50', val: 'text-amber-600' },
          { label: 'Kepatuhan Rendah', value: stats.low, sub: '< 50%', color: 'bg-red-50', val: 'text-red-600' },
          { label: 'Rata-rata', value: `${stats.avgOverall}%`, sub: 'Semua bunda', color: 'bg-sky-50', val: 'text-sky-600' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center border border-sky-100`}>
            <p className={`text-3xl font-black ${s.val}`}>{s.value}</p>
            <p className="font-black text-slate-900 text-xs mt-0.5">{s.label}</p>
            <p className="text-[10px] text-slate-500 font-semibold">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search + sort */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari bunda..."
            className="w-full bg-white border-2 border-sky-100 rounded-2xl pl-10 pr-4 py-2.5 text-slate-900 font-semibold text-sm focus:outline-none focus:border-sky-600" />
        </div>
        <button onClick={() => { if (sortBy === 'compliance') setSortAsc(!sortAsc); else { setSortBy('compliance'); setSortAsc(false); } }}
          className={`px-4 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all ${sortBy === 'compliance' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-sky-600 border-sky-100'}`}>
          <BarChart2 size={14} className="inline mr-1" />Kepatuhan
        </button>
      </div>

      {/* Warning banner if low compliance patients exist */}
      {stats.low > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-sm">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-red-700 text-sm">{stats.low} bunda dengan kepatuhan rendah</p>
            <p className="text-red-600 text-xs font-semibold">Tindaklanjuti untuk mencegah stunting tidak tertangani.</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-card">
        <table className="w-full">
          <thead className="bg-sky-50">
            <tr>
              {['Identitas Bunda', 'Gummy Aktif', 'Total Diminum', 'Kepatuhan', 'Status'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-bold">{search ? 'Tidak ada hasil.' : 'Belum ada data.'}</td></tr>
            ) : filtered.map(p => {
              const cat = compCategory(p.compliance);
              const TrendIcon = cat.trend;
              return (
                <tr key={p.id} className="hover:bg-sky-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-black text-xs shrink-0">
                        {p.full_name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{p.full_name || '-'}</p>
                        <p className="text-xs text-slate-500 font-semibold">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-black text-slate-900">{p.activeMeds}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-black text-slate-900">{p.taken}</span>
                    <span className="text-xs text-slate-400 font-semibold">/{p.expected}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-sky-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${p.compliance}%`, background: p.compliance >= 80 ? '#0284c7' : p.compliance >= 50 ? '#d97706' : '#dc2626' }} />
                      </div>
                      <span className={`font-black text-sm ${cat.tc}`}>{p.compliance}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <TrendIcon size={14} className={cat.tc} />
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
  );
};

export default AdminKepatuhan;

import React, { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, Clock, BarChart2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Alert, Badge, CircularProgress } from '../../components/UIComponents';

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

  const compCategory = v => v >= 80 ? { label: 'Tinggi', color: 'green', trend: TrendingUp, tc: 'text-green-600' }
    : v >= 50 ? { label: 'Sedang', color: 'amber', trend: Minus, tc: 'text-amber-600' }
    : { label: 'Rendah', color: 'red', trend: TrendingDown, tc: 'text-red-600' };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-[#EDD9F5] border-t-[#8B2C8C] rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="bg-gradient-to-br from-[#EDD9F5] to-[#D4A8E0]/40 rounded-2xl p-8 mb-6 border border-[#EDD9F5]">
        <h3 className="text-3xl font-black text-[#8B2C8C] tracking-tight mb-1">Kepatuhan & Monitoring</h3>
        <p className="text-[#6B4B7B] font-semibold text-sm">Data kepatuhan dihitung dari log konfirmasi obat bulan ini dibanding jadwal aktif.</p>
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Kepatuhan Tinggi', value: stats.high, sub: '≥ 80%', color: 'bg-[#EDD9F5]', val: 'text-[#8B2C8C]' },
          { label: 'Kepatuhan Sedang', value: stats.medium, sub: '50–79%', color: 'bg-amber-100', val: 'text-amber-700' },
          { label: 'Kepatuhan Rendah', value: stats.low, sub: '< 50%', color: 'bg-red-100', val: 'text-red-700' },
          { label: 'Rata-rata', value: `${stats.avgOverall}%`, sub: 'Semua pasien', color: 'bg-[#EDD9F5]', val: 'text-[#8B2C8C]' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center border border-white/50`}>
            <p className={`text-3xl font-black ${s.val}`}>{s.value}</p>
            <p className="font-black text-[#2D1B3D] text-xs mt-0.5">{s.label}</p>
            <p className="text-[10px] text-[#B090C0] font-semibold">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search + sort */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B090C0]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pasien..."
            className="w-full bg-white border-2 border-[#EDD9F5] rounded-2xl pl-10 pr-4 py-2.5 text-[#2D1B3D] font-semibold text-sm focus:outline-none focus:border-[#8B2C8C]" />
        </div>
        <button onClick={() => { if (sortBy === 'compliance') setSortAsc(!sortAsc); else { setSortBy('compliance'); setSortAsc(false); } }}
          className={`px-4 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all ${sortBy === 'compliance' ? 'bg-[#8B2C8C] text-white border-[#8B2C8C]' : 'bg-white text-[#8B2C8C] border-[#EDD9F5]'}`}>
          <BarChart2 size={14} className="inline mr-1" />Kepatuhan
        </button>
      </div>

      {/* Warning banner if low compliance patients exist */}
      {stats.low > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-red-700 text-sm">{stats.low} pasien dengan kepatuhan rendah</p>
            <p className="text-red-600 text-xs font-semibold">Pertimbangkan untuk menghubungi mereka langsung.</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EDD9F5] overflow-hidden shadow-card">
        <table className="w-full">
          <thead className="bg-[#EDD9F5]/40">
            <tr>
              {['Pasien', 'Resep Aktif', 'Dosis Diminum', 'Kepatuhan', 'Status'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-[#B090C0] uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDD9F5]">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-[#B090C0] font-bold">{search ? 'Tidak ada hasil.' : 'Belum ada pasien.'}</td></tr>
            ) : filtered.map(p => {
              const cat = compCategory(p.compliance);
              const TrendIcon = cat.trend;
              return (
                <tr key={p.id} className="hover:bg-[#EDD9F5]/20 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#EDD9F5] flex items-center justify-center text-[#8B2C8C] font-black text-xs shrink-0">
                        {p.full_name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-[#2D1B3D] text-sm">{p.full_name || '-'}</p>
                        <p className="text-xs text-[#B090C0] font-semibold">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-black text-[#2D1B3D]">{p.activeMeds}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-black text-[#2D1B3D]">{p.taken}</span>
                    <span className="text-xs text-[#B090C0] font-semibold">/{p.expected}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[#EDD9F5] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${p.compliance}%`, background: p.compliance >= 80 ? '#8B2C8C' : p.compliance >= 50 ? '#D97706' : '#DC2626' }} />
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

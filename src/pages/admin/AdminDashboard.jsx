import React, { useState, useEffect } from 'react';
import { Users, ClipboardCheck, AlertTriangle, Activity, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Alert } from '../../components/UIComponents';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, avgCompliance: 0, severeAlerts: 0, activeMeds: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [severeSymptoms, setSevereSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setError('');
      try {
        // Fetch all in parallel
        const [usersRes, medsRes, logsRes, symptomRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, email, created_at').eq('role', 'user').order('created_at', { ascending: false }),
          supabase.from('medications').select('user_id').eq('is_active', true),
          // Get compliance logs for this month
          supabase.from('compliance_logs').select('user_id, taken_at').eq('status', 'taken')
            .gte('taken_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
          // Severe symptoms in last 7 days containing [EMERGENCY] or [WARNING]
          supabase.from('symptom_logs').select('*, profiles(full_name)').not('notes', 'like', '%NORMAL%')
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false }).limit(10)
        ]);

        const users = usersRes.data || [];
        const logs = logsRes.data || [];
        const syms = symptomRes.data || [];

        // Compute avg compliance: (logs this month / (active meds * days passed))
        const daysInMonth = new Date().getDate();
        const totalExpected = (medsRes.data?.length || 0) * daysInMonth;
        const avgCompliance = totalExpected > 0 ? Math.min(Math.round((logs.length / totalExpected) * 100), 100) : 0;

        // Severe alerts = logs with EMERGENCY tag
        const severeCount = syms.filter(s => s.notes?.includes('[EMERGENCY]') || s.notes?.includes('[WARNING]')).length;

        setStats({
          totalUsers: users.length,
          avgCompliance,
          severeAlerts: severeCount,
          activeMeds: medsRes.data?.length || 0,
        });
        setRecentPatients(users.slice(0, 5));
        setSevereSymptoms(syms.filter(s => s.notes?.includes('[EMERGENCY]') || s.notes?.includes('[WARNING]')).slice(0, 5));
      } catch (err) {
        setError('Gagal memuat data dashboard: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-[#EDD9F5] border-t-[#8B2C8C] rounded-full animate-spin" />
    </div>
  );

  const cards = [
    {
      label: 'Total Pengguna', value: stats.totalUsers, sub: 'Terdaftar sebagai pasien',
      icon: Users, iconBg: 'bg-[#EDD9F5]', iconColor: 'text-[#8B2C8C]',
    },
    {
      label: 'Rata-rata Kepatuhan', value: `${stats.avgCompliance}%`, sub: 'Bulan ini (berdasarkan log)',
      icon: ClipboardCheck, iconBg: stats.avgCompliance >= 80 ? 'bg-[#EDD9F5]' : stats.avgCompliance >= 50 ? 'bg-amber-100' : 'bg-red-100',
      iconColor: stats.avgCompliance >= 80 ? 'text-[#8B2C8C]' : stats.avgCompliance >= 50 ? 'text-amber-700' : 'text-red-700',
      badge: stats.avgCompliance >= 80 ? 'BAIK' : stats.avgCompliance >= 50 ? 'SEDANG' : 'RENDAH',
      badgeColor: stats.avgCompliance >= 80 ? 'bg-[#EDD9F5] text-[#8B2C8C]' : stats.avgCompliance >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700',
    },
    {
      label: 'Alert Gejala Berat', value: stats.severeAlerts, sub: '7 hari terakhir (EMERGENCY+WARNING)',
      icon: AlertTriangle, iconBg: stats.severeAlerts > 0 ? 'bg-red-100' : 'bg-slate-100',
      iconColor: stats.severeAlerts > 0 ? 'text-red-600' : 'text-slate-400',
      valueColor: stats.severeAlerts > 0 ? 'text-red-600' : 'text-[#2D1B3D]',
    },
    {
      label: 'Resep Aktif', value: stats.activeMeds, sub: 'Total obat sedang berjalan',
      icon: Activity, iconBg: 'bg-[#EDD9F5]', iconColor: 'text-[#8B2C8C]',
    },
  ];

  return (
    <div>
      <div className="bg-gradient-to-br from-[#EDD9F5] to-[#D4A8E0]/40 rounded-2xl p-8 mb-8 border border-[#EDD9F5]">
        <h3 className="text-3xl font-black text-[#8B2C8C] mb-2 tracking-tight">Panel Kontrol BiLova</h3>
        <p className="text-[#6B4B7B] font-semibold">Semua data ditampilkan secara real-time dari basis data.</p>
      </div>

      {error && <div className="mb-6"><Alert type="error" message={error} /></div>}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-[#EDD9F5] shadow-card relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-xl ${card.iconBg}`}>
                <card.icon size={22} className={card.iconColor} />
              </div>
              {card.badge && <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${card.badgeColor}`}>{card.badge}</span>}
            </div>
            <p className={`text-3xl font-black mb-0.5 ${card.valueColor || 'text-[#2D1B3D]'}`}>{card.value}</p>
            <p className="text-xs font-bold text-[#B090C0]">{card.label}</p>
            <p className="text-[10px] text-[#D4A8E0] font-semibold mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert gejala berat */}
        <div className="bg-white rounded-2xl border border-[#EDD9F5] shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EDD9F5] flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h4 className="font-black text-[#2D1B3D]">Alert Gejala Berat</h4>
          </div>
          {severeSymptoms.length > 0 ? (
            <div className="divide-y divide-[#EDD9F5]">
              {severeSymptoms.map(log => {
                const isEmerg = log.notes?.includes('[EMERGENCY]');
                return (
                  <div key={log.id} className="px-6 py-3 flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isEmerg ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#2D1B3D] text-sm">{log.profiles?.full_name || 'Anonim'}</p>
                      <p className="text-xs text-[#B090C0] font-semibold">{log.symptoms?.slice(0, 3).join(', ')}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isEmerg ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {isEmerg ? 'DARURAT' : 'PERHATIAN'}
                        </span>
                        <span className="text-[10px] text-[#D4A8E0] font-semibold flex items-center gap-0.5">
                          <Clock size={9} /> {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-base text-red-600">{log.severity}/10</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-bold text-[#B090C0] text-sm">Tidak ada alert gejala berat</p>
            </div>
          )}
        </div>

        {/* Pengguna terbaru */}
        <div className="bg-white rounded-2xl border border-[#EDD9F5] shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EDD9F5] flex items-center gap-2">
            <Users size={16} className="text-[#8B2C8C]" />
            <h4 className="font-black text-[#2D1B3D]">Pengguna Terbaru</h4>
          </div>
          {recentPatients.length > 0 ? (
            <div className="divide-y divide-[#EDD9F5]">
              {recentPatients.map(p => {
                const initials = p.full_name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
                return (
                  <div key={p.id} className="px-6 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EDD9F5] flex items-center justify-center text-[#8B2C8C] font-black text-xs shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#2D1B3D] text-sm truncate">{p.full_name || '-'}</p>
                      <p className="text-xs text-[#B090C0] font-semibold truncate">{p.email}</p>
                    </div>
                    <span className="text-[10px] text-[#D4A8E0] font-semibold shrink-0">
                      {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-sm text-[#B090C0] font-bold">Belum ada pengguna terdaftar.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

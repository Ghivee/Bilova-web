import React, { useState, useEffect } from 'react';
import { Users, ClipboardCheck, AlertTriangle, Activity, TrendingUp, Clock, Fish } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Alert, Modal, Button } from '../../components/UIComponents';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, avgCompliance: 0, severeAlerts: 0, activeMeds: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [severeSymptoms, setSevereSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editAlert, setEditAlert] = useState(null);
  const [deleteAlertId, setDeleteAlertId] = useState(null);

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
          // Pertumbuhan/Gejala in last 30 days containing [EMERGENCY] or [WARNING]
          supabase.from('symptom_logs').select('*, profiles(full_name)').not('notes', 'like', '%NORMAL%')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
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
      <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  const handleUpdateAlert = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('symptom_logs').update({ notes: editAlert.notes, severity: editAlert.severity }).eq('id', editAlert.id);
      if (error) throw new Error(error.message);
      setSevereSymptoms(prev => prev.map(s => s.id === editAlert.id ? { ...s, notes: editAlert.notes, severity: editAlert.severity } : s));
      setEditAlert(null);
    } catch (err) { alert('Gagal memperbarui: ' + err.message); }
  };

  const handleDeleteAlert = async () => {
    try {
      const { error } = await supabase.from('symptom_logs').delete().eq('id', deleteAlertId);
      if (error) throw new Error(error.message);
      setSevereSymptoms(prev => prev.filter(s => s.id !== deleteAlertId));
      setStats(prev => ({ ...prev, severeAlerts: prev.severeAlerts > 0 ? prev.severeAlerts - 1 : 0 }));
      setDeleteAlertId(null);
    } catch (err) { alert('Gagal menghapus: ' + err.message); }
  };

  const cards = [
    {
      label: 'Total Bunda', value: stats.totalUsers, sub: 'Terdaftar di Posyandu ini',
      icon: Users, iconBg: 'bg-sky-100', iconColor: 'text-sky-600',
    },
    {
      label: 'Rata-rata Konsumsi', value: `${stats.avgCompliance}%`, sub: 'Gummy diberikan bulan ini',
      icon: ClipboardCheck, iconBg: stats.avgCompliance >= 80 ? 'bg-sky-100' : stats.avgCompliance >= 50 ? 'bg-amber-100' : 'bg-red-100',
      iconColor: stats.avgCompliance >= 80 ? 'text-sky-600' : stats.avgCompliance >= 50 ? 'text-amber-700' : 'text-red-700',
      badge: stats.avgCompliance >= 80 ? 'BAIK' : stats.avgCompliance >= 50 ? 'SEDANG' : 'RENDAH',
      badgeColor: stats.avgCompliance >= 80 ? 'bg-sky-100 text-sky-600' : stats.avgCompliance >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700',
    },
    {
      label: 'Perhatian Khusus', value: stats.severeAlerts, sub: 'Log pertumbuhan/keluhan stunting',
      icon: AlertTriangle, iconBg: stats.severeAlerts > 0 ? 'bg-red-100' : 'bg-slate-100',
      iconColor: stats.severeAlerts > 0 ? 'text-red-600' : 'text-slate-400',
      valueColor: stats.severeAlerts > 0 ? 'text-red-600' : 'text-slate-800',
    },
    {
      label: 'Program Berjalan', value: stats.activeMeds, sub: 'Jadwal gummy aktif',
      icon: Fish, iconBg: 'bg-cyan-100', iconColor: 'text-cyan-700',
    },
  ];

  return (
    <div>
      <div className="bg-gradient-to-br from-sky-600 to-cyan-500 rounded-2xl p-8 mb-8 shadow-nutrisea text-white">
        <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Panel Posyandu NutriSea</h3>
        <p className="text-white/80 font-semibold">Memantau pertumbuhan dan kepatuhan gizi secara real-time.</p>
      </div>

      {error && <div className="mb-6"><Alert type="error" message={error} /></div>}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-sky-100 shadow-card relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-xl ${card.iconBg}`}>
                <card.icon size={22} className={card.iconColor} />
              </div>
              {card.badge && <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${card.badgeColor}`}>{card.badge}</span>}
            </div>
            <p className={`text-3xl font-black mb-0.5 ${card.valueColor || 'text-slate-900'}`}>{card.value}</p>
            <p className="text-xs font-bold text-slate-500">{card.label}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert gejala */}
        <div className="bg-white rounded-2xl border border-sky-100 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-sky-50 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h4 className="font-black text-slate-900">Perhatian Khusus</h4>
          </div>
          {severeSymptoms.length > 0 ? (
            <div className="divide-y divide-sky-50">
              {severeSymptoms.map(log => {
                const isEmerg = log.notes?.includes('[EMERGENCY]');
                return (
                  <div key={log.id} className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 w-full md:w-auto">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isEmerg ? 'bg-red-500' : 'bg-amber-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {log.profiles?.full_name || 'Anonim'} 
                          {log.severity && <span className="font-black text-xs text-red-600 px-1.5 py-0.5 bg-red-50 rounded-md border border-red-100">Status</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${isEmerg ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                            {isEmerg ? '🚨 DARURAT' : '⚠️ PERHATIAN'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                            <Clock size={10} /> {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {log.notes && <p className="text-xs text-slate-700 font-semibold mt-2 pl-1 border-l-2 border-sky-200">📝 {log.notes}</p>}
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button onClick={() => setEditAlert(log)} className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg text-xs font-bold transition">Tindak Lanjut</button>
                      <button onClick={() => setDeleteAlertId(log.id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <div className="text-4xl mb-2 text-sky-400">🌊</div>
              <p className="font-bold text-slate-500 text-sm">Tidak ada peringatan khusus anak saat ini</p>
            </div>
          )}
        </div>

        {/* Pengguna terbaru */}
        <div className="bg-white rounded-2xl border border-sky-100 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-sky-50 flex items-center gap-2">
            <Users size={16} className="text-sky-600" />
            <h4 className="font-black text-slate-900">Bunda Terbaru</h4>
          </div>
          {recentPatients.length > 0 ? (
            <div className="divide-y divide-sky-50">
              {recentPatients.map(p => {
                const initials = p.full_name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
                return (
                  <div key={p.id} className="px-6 py-3 flex items-center gap-3 hover:bg-sky-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-black text-xs shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{p.full_name || '-'}</p>
                      <p className="text-xs text-slate-400 font-semibold truncate">{p.email}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                      {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-sm text-slate-400 font-bold">Belum ada bunda terdaftar.</div>
          )}
        </div>
      </div>

      {/* Edit Alert Modal */}
      {editAlert && (
        <Modal isOpen={!!editAlert} onClose={() => setEditAlert(null)} title="Tindak Lanjut Laporan Bunda"
          footer={<><Button variant="secondary" onClick={() => setEditAlert(null)}>Batal</Button><Button onClick={handleUpdateAlert} className="bg-sky-600 text-white">Simpan Perubahan</Button></>}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase block mb-1">Catatan Evaluasi Kader</label>
              <textarea value={editAlert.notes || ''} onChange={(e) => setEditAlert({ ...editAlert, notes: e.target.value })}
                rows={3} className="w-full bg-white border-2 border-sky-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
                placeholder="Tambahkan evaluasi..." />
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">TIPS: Hapus teks [EMERGENCY] atau [WARNING] dari catatan untuk mencabut status peringatan (jika terdeteksi dari Nutri-Bot atau jurnal).</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Alert Modal */}
      <Modal isOpen={!!deleteAlertId} onClose={() => setDeleteAlertId(null)} title="Hapus Laporan?"
        footer={<><Button variant="secondary" onClick={() => setDeleteAlertId(null)}>Batal</Button><Button variant="danger" onClick={handleDeleteAlert}>Hapus</Button></>}>
        Apakah Anda yakin ingin menghapus catatan khusus ini dari sistem? Tindakan ini tidak dapat dibatalkan.
      </Modal>

    </div>
  );
};

export default AdminDashboard;

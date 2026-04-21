import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, Edit3, Save, X, Phone, LayoutDashboard, History, HelpCircle, Info, UserCircle2, Calendar, AlertTriangle } from 'lucide-react';
import { Header, CircularProgress, Button, InputField, Modal, Alert } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const WHATSAPP_SUPPORT = '628123456789';

const Profil = () => {
  const { profile, signOut, updateProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', gender: '', allergy_info: '', date_of_birth: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [compliance, setCompliance] = useState({ percentage: 0, taken: 0, total: 0, streak: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        allergy_info: profile.allergy_info || '',
        date_of_birth: profile.date_of_birth || '',
      });
      fetchStats();
      fetchLogs();
    }
  }, [profile]);

  const fetchStats = async () => {
    if (!profile?.id) return;
    try {
      const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
      const dayOfMonth = new Date().getDate();

      const [medsRes, logsRes] = await Promise.all([
        supabase.from('medications').select('id').eq('user_id', profile.id).eq('is_active', true),
        supabase.from('compliance_logs').select('taken_at').eq('user_id', profile.id).eq('status', 'taken').gte('taken_at', startOfMonth.toISOString())
      ]);
      const totalMeds = medsRes.data?.length || 0;
      const taken = logsRes.data?.length || 0;
      const totalExpected = totalMeds * dayOfMonth;
      const pct = totalExpected > 0 ? Math.min(Math.round((taken / totalExpected) * 100), 100) : 0;

      // Streak: count consecutive days with at least 1 log
      let streak = 0;
      if (logsRes.data?.length > 0) {
        const dateSet = new Set(logsRes.data.map(l => new Date(l.taken_at).toDateString()));
        const d = new Date();
        while (dateSet.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
      }
      setCompliance({ percentage: pct, taken, total: totalExpected, streak });
    } catch (err) { console.error('Fetch stats error:', err); }
  };

  const fetchLogs = async () => {
    if (!profile?.id) return;
    try {
      const { data } = await supabase
        .from('compliance_logs').select('*, medications(name, dosage)')
        .eq('user_id', profile.id).order('taken_at', { ascending: false }).limit(15);
      if (data) setRecentLogs(data);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { setError('Nama tidak boleh kosong.'); return; }
    setLoading(true); setError('');
    try {
      await updateProfile({ ...form, is_profile_complete: true });
      setSuccessMsg('Profil berhasil diperbarui!');
      setEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch { window.location.href = '/NutriSea-web/login'; }
  };

  const handleWA = () => {
    const msg = `Halo Admin Posyandu NutriSea, saya membutuhkan bantuan informasi kesehatan. Nama: ${profile?.full_name || '-'}`;
    window.open(`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const initials = profile?.full_name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
  const compColor = compliance.percentage >= 80 ? '#0284c7' : compliance.percentage >= 50 ? '#d97706' : '#dc2626';

  return (
    <div>
      <Header title="Identitas Bunda" />
      <div className="px-5 pb-10 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center py-5">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-600 to-cyan-500 flex items-center justify-center text-white text-3xl font-black shadow-nutrisea mb-3">
            {initials}
          </div>
          <h2 className="text-xl font-black text-slate-900">{profile?.full_name || 'Bunda Hebat'}</h2>
          <p className="text-sm text-slate-500 font-bold">{profile?.email}</p>
          {profile?.allergy_info && (
            <div className="mt-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-red-500" />
              <span className="text-xs font-bold text-red-700">Alergi Anak: {profile.allergy_info}</span>
            </div>
          )}

          {/* Streak badge */}
          {compliance.streak > 0 && (
            <div className="mt-2 bg-sky-100 border border-sky-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-black text-sky-600">{compliance.streak} hari konsisten!</span>
            </div>
          )}
        </div>

        {successMsg && <Alert type="success" message={successMsg} />}
        {error && <Alert type="error" message={error} />}

        {/* Compliance card */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-card flex items-center gap-5">
          <CircularProgress percentage={compliance.percentage} size={96} strokeWidth={9} color={compColor} />
          <div className="flex-1">
            <p className="font-black text-slate-900 text-base mb-1">Status Kepatuhan</p>
            <p className="text-xs text-slate-500 font-semibold">{compliance.taken}/{compliance.total} gummy bulan ini</p>
            <p className="text-xs font-black mt-1" style={{ color: compColor }}>
              {compliance.percentage >= 80 ? '🌟 Luar Biasa!' : compliance.percentage >= 50 ? '👍 Cukup Baik' : '⚠️ Perlu Ditingkatkan'}
            </p>
            {compliance.streak > 1 && (
              <p className="text-[10px] text-sky-600 font-black mt-0.5">🔥 {compliance.streak} hari beruntun</p>
            )}
          </div>
        </div>

        {/* Data pribadi */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-slate-900">Data Identitas Anak</h3>
            <button onClick={() => { setEditing(!editing); setError(''); setSuccessMsg(''); }}
              className="flex items-center gap-1 text-sky-600 font-bold text-sm">
              {editing ? <><X size={14} />Batal</> : <><Edit3 size={14} />Edit</>}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3">
              {[
                { label: 'Nama Lengkap Bunda', name: 'full_name', icon: UserCircle2, placeholder: 'Nama lengkap' },
                { label: 'Telepon', name: 'phone', icon: Phone, placeholder: '08xxx', type: 'tel' },
                { label: 'Info Alergi Anak', name: 'allergy_info', icon: AlertTriangle, placeholder: 'Misal: Seafood' },
              ].map(f => (
                <div key={f.name}>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  <InputField icon={f.icon} name={f.name} placeholder={f.placeholder} type={f.type || 'text'}
                    value={form[f.name] || ''} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 block">Jenis Kelamin Anak</label>
                <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                  className="w-full bg-white border-2 border-sky-100 rounded-2xl px-4 py-3 text-slate-900 font-semibold text-sm focus:outline-none focus:border-sky-600">
                  <option value="">-- Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 block">Tanggal Lahir Anak</label>
                <input type="date" value={form.date_of_birth || ''} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))}
                  className="w-full bg-white border-2 border-sky-100 rounded-2xl px-4 py-3 text-slate-900 font-semibold text-sm focus:outline-none focus:border-sky-600" />
              </div>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Menyimpan...</>
                  : <><Save size={14} />Simpan Perubahan</>}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 divide-y divide-sky-50">
              {[
                { label: 'Nama Bunda', value: profile?.full_name || '-', icon: UserCircle2 },
                { label: 'Telepon', value: profile?.phone || '-', icon: Phone },
                { label: 'JK Anak', value: profile?.gender || '-', icon: UserCircle2 },
                { label: 'Lahir Anak', value: profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-', icon: Calendar },
                { label: 'Alergi', value: profile?.allergy_info || '-', icon: AlertTriangle, danger: !!profile?.allergy_info },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2 text-slate-500 text-sm"><item.icon size={14} /><span className="font-bold">{item.label}</span></div>
                  <span className={`text-sm font-bold ${item.danger ? 'text-red-600' : 'text-slate-900'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action menu */}
        <div className="space-y-3">
          {isAdmin && (
            <button onClick={() => navigate('/admin')}
              className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 rounded-2xl p-5 flex items-center justify-between shadow-nutrisea text-white">
              <div className="flex items-center gap-3 font-black">
                <div className="bg-white/20 p-2 rounded-xl"><LayoutDashboard size={18} /></div> Panel Posyandu
              </div>
              <ChevronRight size={18} />
            </button>
          )}

          {[
            { icon: History, label: 'Riwayat Gummy', action: () => setShowHistoryModal(true), color: false },
            { icon: HelpCircle, label: 'Butuh Bantuan?', desc: 'Chat Posyandu', action: handleWA, color: false, extra: '💬' },
            { icon: Info, label: 'Tentang NutriSea', desc: 'Versi 1.0.0', action: () => setShowAboutModal(true), color: false },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className="w-full bg-white rounded-2xl p-5 flex items-center justify-between border border-sky-100 shadow-card hover:bg-sky-50 transition">
              <div className="flex items-center gap-3">
                <div className="bg-sky-100 p-2.5 rounded-xl"><item.icon size={18} className="text-sky-600" /></div>
                <div className="text-left">
                  <p className="font-black text-slate-900 text-sm">{item.label}</p>
                  {item.desc && <p className="text-xs text-slate-500 font-semibold">{item.desc}</p>}
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>
          ))}

          <button onClick={() => setShowLogoutModal(true)}
            className="w-full bg-red-50 rounded-2xl p-5 flex items-center justify-between border border-red-100 hover:bg-red-100/60 transition shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl border border-red-100"><LogOut size={18} className="text-red-600" /></div>
              <span className="font-black text-red-700">Keluar Sistem</span>
            </div>
            <ChevronRight size={16} className="text-red-300" />
          </button>
        </div>
      </div>

      {/* Logout modal */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Konfirmasi Keluar"
        footer={<><Button variant="secondary" onClick={() => setShowLogoutModal(false)}>Batal</Button><Button variant="danger" onClick={handleLogout}>Keluar</Button></>}>
        Apakah Anda yakin ingin keluar dari akun NutriSea Anda?
      </Modal>

      {/* History modal */}
      <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} title="Riwayat Konsumsi"
        footer={<Button onClick={() => setShowHistoryModal(false)} className="bg-sky-600">Tutup</Button>}>
        <div className="text-left max-h-64 overflow-y-auto space-y-2 scroll-area">
          {recentLogs.length > 0 ? recentLogs.map(log => (
            <div key={log.id} className="bg-sky-50 rounded-2xl p-3 border border-sky-100 shadow-sm">
              <p className="font-black text-slate-900 text-sm">{log.medications?.name} {log.medications?.dosage}</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{new Date(log.taken_at).toLocaleString('id-ID')}</p>
            </div>
          )) : <p className="text-center py-6 text-slate-400 text-sm">Belum ada riwayat konsumsi.</p>}
        </div>
      </Modal>

      {/* About modal */}
      <Modal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} title="Tentang NutriSea"
        footer={<Button onClick={() => setShowAboutModal(false)} className="bg-sky-600">Tutup</Button>}>
        <div className="text-center">
          <div className="text-5xl mb-3">🐠</div>
          <p className="font-bold text-slate-700 leading-relaxed text-sm">
            <strong>NutriSea</strong> adalah inovasi sistem intervensi stunting berbasis pangan fungsional dummy dari fauna laut yang membantu pemantauan dan edukasi masyarakat secara real-time.
          </p>
          <div className="mt-4 bg-sky-50 rounded-2xl p-3 border border-sky-100">
            <p className="text-xs text-slate-500 font-bold">Versi 1.0.0 · © 2026 NutriSea</p>
            <p className="text-xs text-slate-500 font-semibold">Mengurangi angka stunting Indonesia dengan teknologi & gizi</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profil;
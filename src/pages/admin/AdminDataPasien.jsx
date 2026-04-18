import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Save, X, Search, ChevronRight, ChevronLeft, Pill, Clock, AlertTriangle, User, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, Badge, Modal, Button } from '../../components/UIComponents';

const emptyMed = { name: '', dosage: '', frequency: '', instruction: '', start_date: '', end_date: '', total_tablets: 0, remaining_tablets: 0, schedule_times: ['08:00'], admin_notes: '', is_active: true };

const AdminDataPasien = () => {
  const { profile: adminProfile } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [patientMeds, setPatientMeds] = useState([]);
  const [patientLogs, setPatientLogs] = useState([]);
  const [patientSymptoms, setPatientSymptoms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMedForm, setShowMedForm] = useState(false);
  const [editMedId, setEditMedId] = useState(null);
  const [medForm, setMedForm] = useState({ ...emptyMed });
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null); // { id, type }
  const [activeTab, setActiveTab] = useState('data'); // 'data' | 'obat' | 'kepatuhan' | 'gejala'

  const fetchPatients = useCallback(async () => {
    setError('');
    try {
      const { data, error } = await supabase
        .from('profiles').select('*').eq('role', 'user').order('full_name');
      if (error) throw new Error('Gagal memuat data pasien: ' + error.message);
      setPatients(data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const selectPatient = async (p) => {
    setSelected(p);
    setActiveTab('obat'); // Fitur utama: Resep Obat langsung terbuka
    setError('');
    try {
      const [medRes, logRes, sympRes] = await Promise.all([
        supabase.from('medications').select('*').eq('user_id', p.id).order('created_at', { ascending: false }),
        supabase.from('compliance_logs').select('*, medications(name,dosage)').eq('user_id', p.id).order('taken_at', { ascending: false }).limit(20),
        supabase.from('symptom_logs').select('*').eq('user_id', p.id).order('created_at', { ascending: false }).limit(10)
      ]);
      setPatientMeds(medRes.data || []);
      setPatientLogs(logRes.data || []);
      setPatientSymptoms(sympRes.data || []);
    } catch (err) { setError('Gagal memuat detail pasien: ' + err.message); }
  };

  const openMedForm = (med = null) => {
    setEditMedId(med?.id || null);
    setMedForm(med ? { ...med, schedule_times: med.schedule_times || ['08:00'] } : { ...emptyMed, start_date: new Date().toISOString().split('T')[0] });
    setShowMedForm(true);
  };

  const saveMed = async (e) => {
    e.preventDefault();
    if (!medForm.name?.trim()) { setError('Nama obat wajib diisi.'); return; }
    if (!medForm.dosage?.trim()) { setError('Dosis obat wajib diisi.'); return; }
    if (!medForm.frequency?.trim()) { setError('Frekuensi wajib diisi.'); return; }
    if (!medForm.start_date) { setError('Tanggal mulai wajib diisi.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        ...medForm,
        user_id: selected.id,
        prescribed_by: adminProfile?.id,
        total_tablets: Number(medForm.total_tablets) || 0,
        remaining_tablets: editMedId ? Number(medForm.remaining_tablets) : Number(medForm.total_tablets) || 0,
      };
      if (editMedId) {
        const { error } = await supabase.from('medications').update(payload).eq('id', editMedId);
        if (error) throw new Error('Gagal memperbarui obat: ' + error.message);
      } else {
        const { error } = await supabase.from('medications').insert(payload);
        if (error) throw new Error('Gagal menambah obat: ' + error.message);
      }
      setShowMedForm(false);
      await selectPatient(selected);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const toggleMedStatus = async (id, isActive) => {
    try {
      const { error } = await supabase.from('medications').update({ is_active: !isActive }).eq('id', id);
      if (error) throw new Error('Gagal mengubah status: ' + error.message);
      await selectPatient(selected);
    } catch (err) { setError(err.message); }
  };

  const deleteMed = async () => {
    if (!deleteModal) return;
    try {
      const { error } = await supabase.from('medications').delete().eq('id', deleteModal.id);
      if (error) throw new Error('Gagal menghapus obat: ' + error.message);
      setDeleteModal(null);
      await selectPatient(selected);
    } catch (err) { setError(err.message); }
  };

  // Compute patient compliance %
  const patientCompliance = (() => {
    const startMonth = new Date(); startMonth.setDate(1); startMonth.setHours(0,0,0,0);
    const monthLogs = patientLogs.filter(l => new Date(l.taken_at) >= startMonth);
    const daysIn = new Date().getDate();
    const activeMeds = patientMeds.filter(m => m.is_active).length;
    const expected = activeMeds * daysIn;
    return expected > 0 ? Math.min(Math.round((monthLogs.length / expected) * 100), 100) : 0;
  })();

  const filtered = patients.filter(p =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = n => n?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-[#EDD9F5] border-t-[#8B2C8C] rounded-full animate-spin" />
    </div>
  );

  /* ─── Patient Detail View ─── */
  if (selected) {
    return (
      <div>
        {/* Back */}
        <button onClick={() => { setSelected(null); setShowMedForm(false); setError(''); }}
          className="flex items-center gap-2 text-[#8B2C8C] font-bold text-sm mb-6 hover:text-[#C85CA0]">
          <ChevronLeft size={18} /> Kembali ke Daftar
        </button>

        {/* Patient header */}
        <div className="bg-gradient-to-br from-[#EDD9F5] to-[#D4A8E0]/40 rounded-2xl p-6 mb-6 border border-[#EDD9F5]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B2C8C] to-[#C85CA0] flex items-center justify-center text-white font-black text-xl shadow-bilova-sm">
              {getInitials(selected.full_name)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#8B2C8C]">{selected.full_name || '-'}</h2>
              <p className="text-[#6B4B7B] font-semibold text-sm">{selected.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selected.gender && <Badge>{selected.gender}</Badge>}
                {selected.phone && <Badge color="slate">{selected.phone}</Badge>}
                {selected.allergy_info && <Badge color="red">Alergi: {selected.allergy_info}</Badge>}
              </div>
            </div>
            {/* Compliance badge */}
            <div className="ml-auto text-right">
              <p className="text-xs font-black text-[#B090C0] uppercase mb-1">Kepatuhan</p>
              <p className={`text-3xl font-black ${patientCompliance >= 80 ? 'text-[#8B2C8C]' : patientCompliance >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {patientCompliance}%
              </p>
            </div>
          </div>
        </div>

        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

        {/* Tabs */}
        <div className="flex gap-1 bg-[#EDD9F5]/50 p-1 rounded-2xl mb-5 overflow-x-auto hide-scrollbar">
          {[
            { key: 'data', label: 'Data Pribadi' },
            { key: 'obat', label: `Resep Obat (${patientMeds.length})` },
            { key: 'kepatuhan', label: `Log Kepatuhan (${patientLogs.length})` },
            { key: 'gejala', label: `Gejala (${patientSymptoms.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === t.key ? 'bg-white text-[#8B2C8C] shadow-card' : 'text-[#B090C0]'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Data Pribadi */}
        {activeTab === 'data' && (
          <div className="bg-white rounded-2xl p-6 border border-[#EDD9F5] space-y-3">
            {[
              { label: 'Nama Lengkap', value: selected.full_name },
              { label: 'Email', value: selected.email },
              { label: 'Telepon', value: selected.phone || '-' },
              { label: 'Jenis Kelamin', value: selected.gender || '-' },
              { label: 'Tanggal Lahir', value: selected.date_of_birth ? new Date(selected.date_of_birth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
              { label: 'Alergi', value: selected.allergy_info || '-', danger: !!selected.allergy_info },
              { label: 'Bergabung', value: new Date(selected.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-[#EDD9F5] last:border-0">
                <span className="text-sm font-black text-[#B090C0]">{item.label}</span>
                <span className={`text-sm font-bold ${item.danger ? 'text-red-600' : 'text-[#2D1B3D]'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Resep Obat */}
        {activeTab === 'obat' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-[#2D1B3D]">Resep Obat</h4>
              <button onClick={() => openMedForm()}
                className="flex items-center gap-2 px-4 py-2 bg-[#8B2C8C] text-white rounded-xl font-bold text-sm hover:bg-[#6B1B6C] transition">
                <Plus size={14} /> Tambah Resep
              </button>
            </div>

            {/* Med form */}
            {showMedForm && (
              <form onSubmit={saveMed} className="bg-[#EDD9F5]/30 rounded-2xl p-5 border border-[#EDD9F5] mb-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-black text-[#2D1B3D]">{editMedId ? 'Edit Resep' : 'Resep Baru'}</h5>
                  <button type="button" onClick={() => { setShowMedForm(false); setEditMedId(null); setError(''); }} className="text-[#B090C0] hover:text-[#8B2C8C]"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nama Obat', name: 'name', placeholder: 'Amoxicillin', required: true },
                    { label: 'Dosis', name: 'dosage', placeholder: '500 mg', required: true },
                    { label: 'Frekuensi', name: 'frequency', placeholder: '3x sehari', required: true },
                    { label: 'Instruksi', name: 'instruction', placeholder: 'Sesudah makan' },
                    { label: 'Tanggal Mulai', name: 'start_date', type: 'date', required: true },
                    { label: 'Tanggal Selesai', name: 'end_date', type: 'date' },
                    { label: 'Total Tablet', name: 'total_tablets', type: 'number', placeholder: '21' },
                    { label: 'Catatan Admin', name: 'admin_notes', placeholder: 'Catatan tambahan untuk pasien' },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-1 block">{f.label} {f.required && '*'}</label>
                      <input name={f.name} type={f.type || 'text'} placeholder={f.placeholder} value={medForm[f.name] || ''}
                        onChange={e => setMedForm(p => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full bg-white border-2 border-[#EDD9F5] rounded-xl px-3 py-2.5 text-[#2D1B3D] font-semibold text-sm focus:outline-none focus:border-[#8B2C8C]" />
                    </div>
                  ))}
                </div>
                {/* Schedule times */}
                <div>
                  <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-2 block">Jadwal Minum <span className="font-semibold normal-case">(jam, pisahkan dengan koma)</span></label>
                  <input type="text" value={medForm.schedule_times?.join(', ') || '08:00'}
                    onChange={e => setMedForm(p => ({ ...p, schedule_times: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                    placeholder="08:00, 14:00, 20:00"
                    className="w-full bg-white border-2 border-[#EDD9F5] rounded-xl px-3 py-2.5 text-[#2D1B3D] font-semibold text-sm focus:outline-none focus:border-[#8B2C8C]" />
                </div>
                {error && <Alert type="error" message={error} />}
                <div className="flex gap-3">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#8B2C8C] text-white rounded-xl font-bold text-sm hover:bg-[#6B1B6C] disabled:opacity-50 transition">
                    <Save size={14} /> {saving ? 'Menyimpan...' : editMedId ? 'Simpan' : 'Tambahkan'}
                  </button>
                  <button type="button" onClick={() => { setShowMedForm(false); setEditMedId(null); }}
                    className="px-5 py-2.5 bg-[#EDD9F5] text-[#8B2C8C] rounded-xl font-bold text-sm hover:bg-[#D4A8E0] transition">
                    Batal
                  </button>
                </div>
              </form>
            )}

            {patientMeds.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#EDD9F5]">
                <div className="text-4xl mb-2">💊</div>
                <p className="font-bold text-[#B090C0] text-sm">Belum ada resep obat untuk pasien ini.</p>
              </div>
            ) : patientMeds.map(med => (
              <div key={med.id} className={`bg-white rounded-2xl p-5 border-2 mb-3 ${med.is_active ? 'border-[#EDD9F5]' : 'border-slate-100 opacity-70'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${med.is_active ? 'bg-[#EDD9F5]' : 'bg-slate-100'}`}>
                      <Pill size={18} className={med.is_active ? 'text-[#8B2C8C]' : 'text-slate-400'} />
                    </div>
                    <div>
                      <p className="font-black text-[#2D1B3D]">{med.name} <span className="text-[#8B2C8C]">{med.dosage}</span></p>
                      <p className="text-xs text-[#B090C0] font-semibold">{med.frequency}</p>
                      {med.schedule_times?.length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} className="text-[#B090C0]" />
                          <span className="text-[10px] text-[#B090C0] font-semibold">{med.schedule_times.join(' · ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleMedStatus(med.id, med.is_active)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${med.is_active ? 'bg-[#EDD9F5] text-[#8B2C8C]' : 'bg-slate-100 text-slate-500'}`}>
                      {med.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button onClick={() => openMedForm(med)} className="p-1.5 rounded-xl hover:bg-[#EDD9F5] transition text-[#B090C0] hover:text-[#8B2C8C]"><Edit3 size={14} /></button>
                    <button onClick={() => setDeleteModal({ id: med.id })} className="p-1.5 rounded-xl hover:bg-red-50 transition text-[#B090C0] hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 bg-[#FCF7FF] rounded-xl p-3 text-xs">
                  <div><span className="text-[#B090C0] font-bold block">Instruksi</span><span className="font-bold text-[#2D1B3D]">{med.instruction || '-'}</span></div>
                  <div><span className="text-[#B090C0] font-bold block">Sisa</span><span className="font-bold text-[#8B2C8C]">{med.remaining_tablets} tab</span></div>
                  <div><span className="text-[#B090C0] font-bold block">Selesai</span><span className="font-bold text-[#2D1B3D]">{med.end_date ? new Date(med.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</span></div>
                </div>
                {med.admin_notes && <p className="text-xs text-[#8B2C8C] font-semibold mt-2 pl-1">📝 {med.admin_notes}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Kepatuhan */}
        {activeTab === 'kepatuhan' && (
          <div>
            <div className="bg-gradient-to-br from-[#EDD9F5] to-[#D4A8E0]/30 rounded-2xl p-4 mb-4 border border-[#EDD9F5] flex items-center gap-4">
              <div className={`text-4xl font-black ${patientCompliance >= 80 ? 'text-[#8B2C8C]' : patientCompliance >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {patientCompliance}%
              </div>
              <div>
                <p className="font-black text-[#2D1B3D]">Kepatuhan Bulan Ini</p>
                <p className="text-xs text-[#B090C0] font-semibold">{patientLogs.filter(l => new Date(l.taken_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length} log tercatat</p>
              </div>
            </div>
            {patientLogs.length === 0 ? (
              <div className="text-center py-8 text-[#B090C0] font-bold">Belum ada log kepatuhan.</div>
            ) : (
              <div className="space-y-2">
                {patientLogs.map(log => (
                  <div key={log.id} className="bg-white rounded-xl p-3 border border-[#EDD9F5] flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${log.status === 'taken' ? 'bg-[#8B2C8C]' : 'bg-red-400'}`} />
                    <div className="flex-1">
                      <p className="font-bold text-[#2D1B3D] text-sm">{log.medications?.name} {log.medications?.dosage}</p>
                      <p className="text-xs text-[#B090C0] font-semibold">{new Date(log.taken_at).toLocaleString('id-ID')}</p>
                    </div>
                    <Badge color={log.status === 'taken' ? 'purple' : 'red'}>{log.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Gejala */}
        {activeTab === 'gejala' && (
          <div className="space-y-3">
            {patientSymptoms.length === 0 ? (
              <div className="text-center py-8 text-[#B090C0] font-bold">Belum ada laporan gejala.</div>
            ) : patientSymptoms.map(log => {
              const isEmerg = log.notes?.includes('[EMERGENCY]');
              const isWarn = log.notes?.includes('[WARNING]');
              return (
                <div key={log.id} className={`bg-white rounded-2xl p-4 border-2 ${isEmerg ? 'border-red-200' : isWarn ? 'border-amber-200' : 'border-[#EDD9F5]'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap gap-1">
                      {log.symptoms?.map((s, i) => <span key={i} className="text-[10px] bg-[#EDD9F5] text-[#8B2C8C] px-2 py-0.5 rounded-full font-bold">{s}</span>)}
                    </div>
                    <span className="font-black text-lg ml-2 shrink-0" style={{ color: log.severity <= 3 ? '#DC2626' : log.severity <= 6 ? '#D97706' : '#8B2C8C' }}>
                      {log.severity}/10
                    </span>
                  </div>
                  {(isEmerg || isWarn) && (
                    <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full mb-1.5 ${isEmerg ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {isEmerg ? '🚨 DARURAT' : '⚠️ PERHATIAN'}
                    </span>
                  )}
                  <p className="text-[10px] text-[#B090C0] font-semibold">{new Date(log.created_at).toLocaleString('id-ID')}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete confirmation */}
        <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Resep Obat?"
          footer={<><Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button><Button variant="danger" onClick={deleteMed}>Hapus</Button></>}>
          Resep obat ini akan dihapus permanen dan tidak bisa dikembalikan.
        </Modal>
      </div>
    );
  }

  /* ─── Patient List ─── */
  return (
    <div>
      <div className="bg-gradient-to-br from-[#EDD9F5] to-[#D4A8E0]/40 rounded-2xl p-8 mb-6 border border-[#EDD9F5]">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h3 className="text-3xl font-black text-[#8B2C8C] tracking-tight mb-1">Data Pasien</h3>
            <p className="text-[#6B4B7B] font-semibold text-sm">{patients.length} pasien terdaftar · Klik untuk detail & kelola resep</p>
          </div>
        </div>
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B090C0]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau email pasien..."
          className="w-full bg-white border-2 border-[#EDD9F5] rounded-2xl pl-10 pr-4 py-3 text-[#2D1B3D] font-semibold text-sm focus:outline-none focus:border-[#8B2C8C]" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EDD9F5] overflow-hidden shadow-card">
        <table className="w-full">
          <thead className="bg-[#EDD9F5]/40">
            <tr>
              {['Pasien', 'Kontak', 'Alergi', 'Bergabung', 'Aksi'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-[#B090C0] uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDD9F5]">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-[#B090C0] font-bold">
                {search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada pasien.'}
              </td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-[#EDD9F5]/20 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EDD9F5] flex items-center justify-center text-[#8B2C8C] font-black text-xs shrink-0">
                      {getInitials(p.full_name)}
                    </div>
                    <div>
                      <p className="font-bold text-[#2D1B3D] text-sm">{p.full_name || '-'}</p>
                      <p className="text-xs text-[#B090C0] font-semibold">{p.gender || '-'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-[#6B4B7B] font-semibold">{p.phone || p.email?.split('@')[0]}</td>
                <td className="px-5 py-4">
                  {p.allergy_info ? <Badge color="red">{p.allergy_info}</Badge> : <span className="text-[#D4A8E0] text-xs font-semibold">-</span>}
                </td>
                <td className="px-5 py-4 text-xs text-[#B090C0] font-semibold">
                  {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => selectPatient(p)} className="text-[#8B2C8C] font-bold text-sm hover:text-[#C85CA0] flex items-center gap-1">
                    Detail <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDataPasien;

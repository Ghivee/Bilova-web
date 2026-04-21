import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Save, X, Search, ChevronRight, ChevronLeft, Clock, User, Fish, BarChart2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, Badge, Modal, Button } from '../../components/UIComponents';

const emptyMed = { name: '', dosage: '', frequency: '', instruction: '', start_date: '', end_date: '', total_tablets: 0, remaining_tablets: 0, schedule_times: ['08:00'], admin_notes: '', is_active: true };

const AdminDataBalita = () => {
  const { profile: adminProfile } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [patientMeds, setPatientMeds] = useState([]);
  const [patientLogs, setPatientLogs] = useState([]);
  const [patientSymptoms, setPatientSymptoms] = useState([]); // This stores Tumbuh Kembang data now
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMedForm, setShowMedForm] = useState(false);
  const [editMedId, setEditMedId] = useState(null);
  const [medForm, setMedForm] = useState({ ...emptyMed });
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null); // { id, type }
  const [activeTab, setActiveTab] = useState('data'); // 'data' | 'obat' | 'kepatuhan' | 'pertumbuhan'

  const fetchPatients = useCallback(async () => {
    setError('');
    try {
      const { data, error } = await supabase
        .from('profiles').select('*').eq('role', 'user').order('full_name');
      if (error) throw new Error('Gagal memuat data bunda: ' + error.message);
      setPatients(data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const selectPatient = async (p) => {
    setSelected(p);
    setActiveTab('data');
    setError('');
    try {
      const [medRes, logRes, sympRes] = await Promise.all([
        supabase.from('medications').select('*').eq('user_id', p.id).order('created_at', { ascending: false }),
        supabase.from('compliance_logs').select('*, medications(name,dosage)').eq('user_id', p.id).order('taken_at', { ascending: false }).limit(20),
        supabase.from('symptom_logs').select('*').eq('user_id', p.id).contains('symptoms', ['tumbuh_kembang']).order('created_at', { ascending: false }).limit(10)
      ]);
      setPatientMeds(medRes.data || []);
      setPatientLogs(logRes.data || []);
      setPatientSymptoms(sympRes.data || []);
    } catch (err) { setError('Gagal memuat detail bunda: ' + err.message); }
  };

  const openMedForm = (med = null) => {
    setEditMedId(med?.id || null);
    setMedForm(med ? { ...med, schedule_times: med.schedule_times || ['08:00'] } : { ...emptyMed, start_date: new Date().toISOString().split('T')[0], name: 'NutriSea Gummy', dosage: '1 Gummy' });
    setShowMedForm(true);
  };

  const saveMed = async (e) => {
    e.preventDefault();
    if (!medForm.name?.trim()) { setError('Nama gummy wajib diisi.'); return; }
    if (!medForm.dosage?.trim()) { setError('Dosis gummy wajib diisi.'); return; }
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
        if (error) throw new Error('Gagal memperbarui jadwal: ' + error.message);
      } else {
        const { error } = await supabase.from('medications').insert(payload);
        if (error) throw new Error('Gagal menambah jadwal: ' + error.message);
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
      if (error) throw new Error('Gagal menghapus jadwal: ' + error.message);
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
      <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  /* ─── Patient Detail View ─── */
  if (selected) {
    return (
      <div>
        {/* Back */}
        <button onClick={() => { setSelected(null); setShowMedForm(false); setError(''); }}
          className="flex items-center gap-2 text-sky-600 font-bold text-sm mb-6 hover:text-sky-700">
          <ChevronLeft size={18} /> Kembali ke Database
        </button>

        {/* Patient header */}
        <div className="bg-gradient-to-br from-sky-100 to-sky-50 rounded-2xl p-6 mb-6 border border-sky-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-nutrisea-sm">
              {getInitials(selected.full_name)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-sky-600">{selected.full_name || '-'}</h2>
              <p className="text-slate-600 font-semibold text-sm">{selected.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selected.gender && <Badge>{selected.gender}</Badge>}
                {selected.phone && <Badge color="slate">{selected.phone}</Badge>}
              </div>
            </div>
            {/* Compliance badge */}
            <div className="ml-auto text-right">
              <p className="text-xs font-black text-slate-400 uppercase mb-1">Kepatuhan Beri Gummy</p>
              <p className={`text-3xl font-black ${patientCompliance >= 80 ? 'text-sky-600' : patientCompliance >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {patientCompliance}%
              </p>
            </div>
          </div>
        </div>

        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

        {/* Tabs */}
        <div className="flex gap-1 bg-sky-100 p-1 rounded-2xl mb-5 overflow-x-auto hide-scrollbar">
          {[
            { key: 'data', label: 'Identitas Bunda' },
            { key: 'pertumbuhan', label: `Pertumbuhan Anak (${patientSymptoms.length})` },
            { key: 'obat', label: `Jadwal Konsumsi (${patientMeds.length})` },
            { key: 'kepatuhan', label: `Log Kepatuhan (${patientLogs.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === t.key ? 'bg-white text-sky-600 shadow-card' : 'text-slate-500'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Data Pribadi */}
        {activeTab === 'data' && (
          <div className="bg-white rounded-2xl p-6 border border-sky-100 space-y-3">
            {[
              { label: 'Nama Lengkap Bunda', value: selected.full_name },
              { label: 'Email', value: selected.email },
              { label: 'Nomor Telepon', value: selected.phone || '-' },
              { label: 'Jenis Kelamin Anak', value: selected.gender || '-' },
              { label: 'Tanggal Lahir Anak', value: selected.date_of_birth ? new Date(selected.date_of_birth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
              { label: 'Data Tercatat Sejak', value: new Date(selected.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-sky-50 last:border-0">
                <span className="text-sm font-black text-slate-400">{item.label}</span>
                <span className={`text-sm font-bold text-slate-800`}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Pertumbuhan (Tumbuh Kembang) */}
        {activeTab === 'pertumbuhan' && (
          <div className="space-y-3">
            {patientSymptoms.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-bold">Belum ada jurnal pertumbuhan anak yang dicatat bunda.</div>
            ) : patientSymptoms.map(log => {
              // Parse height and weight from notes
               const tbMatch = log.notes?.match(/TB:\s*(\d+(\.\d+)?)\s*cm/);
               const bbMatch = log.notes?.match(/BB:\s*(\d+(\.\d+)?)\s*kg/);
               const noteDetailsMatch = log.notes?.match(/Catatan:\s*(.*)/);
               const actualNote = noteDetailsMatch ? noteDetailsMatch[1] : '';

              return (
                <div key={log.id} className={`bg-white rounded-2xl p-4 border-2 border-sky-100`}>
                  <div className="flex justify-between items-center mb-2 border-b border-sky-50 pb-2">
                     <div className="flex items-center gap-4">
                        <div className="text-center">
                           <p className="text-[10px] uppercase font-black text-slate-400">Tinggi</p>
                           <p className="font-black text-slate-900">{tbMatch ? tbMatch[1] : '-'} <span className="text-xs font-bold text-slate-500">cm</span></p>
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] uppercase font-black text-slate-400">Berat</p>
                           <p className="font-black text-slate-900">{bbMatch ? bbMatch[1] : '-'} <span className="text-xs font-bold text-slate-500">kg</span></p>
                        </div>
                     </div>
                     <p className="text-[10px] text-slate-400 font-bold flex items-center justify-end gap-1">
                        <Clock size={10} />
                        {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year:'numeric' })}
                     </p>
                  </div>
                  {actualNote && <p className="text-xs font-semibold text-slate-600 bg-sky-50 p-2 rounded-lg inline-block text-left w-full">" {actualNote} "</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab: Jadwal Gummy */}
        {activeTab === 'obat' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-slate-900">Jadwal Konsumsi NutriSea</h4>
              <button onClick={() => openMedForm()}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition">
                <Plus size={14} /> Tambah Jadwal
              </button>
            </div>

            {/* Med form */}
            {showMedForm && (
              <form onSubmit={saveMed} className="bg-sky-50 rounded-2xl p-5 border border-sky-100 mb-5 space-y-4 shadow-inner">
                <div className="flex justify-between items-center">
                  <h5 className="font-black text-slate-900">{editMedId ? 'Edit Jadwal' : 'Jadwal Baru'}</h5>
                  <button type="button" onClick={() => { setShowMedForm(false); setEditMedId(null); setError(''); }} className="text-slate-400 hover:text-sky-600"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nama Gummy / Produk', name: 'name', placeholder: 'NutriSea Original', required: true },
                    { label: 'Dosis', name: 'dosage', placeholder: '1 Gummy', required: true },
                    { label: 'Frekuensi', name: 'frequency', placeholder: '1x sehari', required: true },
                    { label: 'Instruksi', name: 'instruction', placeholder: 'Setelah makan pagi' },
                    { label: 'Tanggal Mulai Diberikan', name: 'start_date', type: 'date', required: true },
                    { label: 'Tanggal Selesai Program', name: 'end_date', type: 'date' },
                    { label: 'Total Persediaan (Biji)', name: 'total_tablets', type: 'number', placeholder: '30' },
                    { label: 'Catatan Kader', name: 'admin_notes', placeholder: 'Pesan kader ke bunda' },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1 block">{f.label} {f.required && '*'}</label>
                      <input name={f.name} type={f.type || 'text'} placeholder={f.placeholder} value={medForm[f.name] || ''}
                        onChange={e => setMedForm(p => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full bg-white border-2 border-sky-100 rounded-xl px-3 py-2.5 text-slate-900 font-semibold text-sm focus:outline-none focus:border-sky-600" />
                    </div>
                  ))}
                </div>
                {/* Schedule times */}
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Jam Pengingat Otomatis <span className="font-semibold normal-case">(jam, pisahkan koma)</span></label>
                  <input type="text" value={medForm.schedule_times?.join(', ') || '08:00'}
                    onChange={e => setMedForm(p => ({ ...p, schedule_times: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                    placeholder="08:00"
                    className="w-full bg-white border-2 border-sky-100 rounded-xl px-3 py-2.5 text-slate-900 font-semibold text-sm focus:outline-none focus:border-sky-600" />
                </div>
                {error && <Alert type="error" message={error} />}
                <div className="flex gap-3">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 disabled:opacity-50 transition">
                    <Save size={14} /> {saving ? 'Menyimpan...' : editMedId ? 'Simpan' : 'Tambahkan'}
                  </button>
                  <button type="button" onClick={() => { setShowMedForm(false); setEditMedId(null); }}
                    className="px-5 py-2.5 bg-sky-100 text-sky-600 rounded-xl font-bold text-sm hover:bg-sky-200 transition">
                    Batal
                  </button>
                </div>
              </form>
            )}

            {patientMeds.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-sky-100">
                <div className="text-4xl mb-2">🐠</div>
                <p className="font-bold text-slate-400 text-sm">Belum ada jadwal konsumsi.</p>
              </div>
            ) : patientMeds.map(med => (
              <div key={med.id} className={`bg-white rounded-2xl p-5 border-2 mb-3 shadow-card ${med.is_active ? 'border-sky-100' : 'border-slate-100 opacity-70'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${med.is_active ? 'bg-sky-100' : 'bg-slate-100'}`}>
                      <Fish size={18} className={med.is_active ? 'text-sky-600' : 'text-slate-400'} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{med.name} <span className="text-sky-600">{med.dosage}</span></p>
                      <p className="text-xs text-slate-500 font-semibold">{med.frequency}</p>
                      {med.schedule_times?.length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} className="text-slate-400" />
                          <span className="text-[10px] text-slate-400 font-semibold">{med.schedule_times.join(' · ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleMedStatus(med.id, med.is_active)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${med.is_active ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>
                      {med.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button onClick={() => openMedForm(med)} className="p-1.5 rounded-xl hover:bg-sky-50 transition text-slate-400 hover:text-sky-600"><Edit3 size={14} /></button>
                    <button onClick={() => setDeleteModal({ id: med.id })} className="p-1.5 rounded-xl hover:bg-red-50 transition text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 bg-sky-50 rounded-xl p-3 text-xs border border-sky-100">
                  <div><span className="text-slate-500 font-bold block">Instruksi</span><span className="font-bold text-slate-900">{med.instruction || '-'}</span></div>
                  <div><span className="text-slate-500 font-bold block">Sisa</span><span className="font-bold text-sky-600">{med.remaining_tablets} gummy</span></div>
                  <div><span className="text-slate-500 font-bold block">Selesai</span><span className="font-bold text-slate-900">{med.end_date ? new Date(med.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</span></div>
                </div>
                {med.admin_notes && <p className="text-xs text-sky-600 font-semibold mt-2 pl-1">📝 Pesan Kader: {med.admin_notes}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Kepatuhan */}
        {activeTab === 'kepatuhan' && (
          <div>
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl p-4 mb-4 border border-sky-100 flex items-center gap-4">
              <div className={`text-4xl font-black ${patientCompliance >= 80 ? 'text-sky-600' : patientCompliance >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {patientCompliance}%
              </div>
              <div>
                <p className="font-black text-slate-900">Kepatuhan Target Bulan Ini</p>
                <p className="text-xs text-slate-500 font-semibold">{patientLogs.filter(l => new Date(l.taken_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length} laporan konsumsi anak tercatat</p>
              </div>
            </div>
            {patientLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-bold">Belum ada aktivitas.</div>
            ) : (
              <div className="space-y-2">
                {patientLogs.map(log => (
                  <div key={log.id} className="bg-white rounded-xl p-3 border border-sky-100 flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${log.status === 'taken' ? 'bg-sky-600' : 'bg-red-400'}`} />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{log.medications?.name} {log.medications?.dosage}</p>
                      <p className="text-xs text-slate-400 font-semibold">{new Date(log.taken_at).toLocaleString('id-ID')}</p>
                    </div>
                    <Badge color={log.status === 'taken' ? 'sky' : 'red'}>{log.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete confirmation */}
        <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Jadwal?"
          footer={<><Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button><Button variant="danger" onClick={deleteMed}>Hapus</Button></>}>
          Jadwal konsumsi gummy ini akan dihapus permanen dan tidak bisa dikembalikan.
        </Modal>
      </div>
    );
  }

  /* ─── Patient List ─── */
  return (
    <div>
      <div className="bg-gradient-to-br from-sky-600 to-cyan-500 rounded-2xl p-8 mb-6 shadow-nutrisea text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight mb-1">Database Real-Time Bunda</h3>
            <p className="text-white/80 font-semibold text-sm">{patients.length} bunda terdaftar posyandu · Klik untuk detail pertumbuhan balita</p>
          </div>
        </div>
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama bunda atau email..."
          className="w-full bg-white border-2 border-sky-100 rounded-2xl pl-10 pr-4 py-3 text-slate-900 font-semibold text-sm focus:outline-none focus:border-sky-600" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-card">
        <table className="w-full">
          <thead className="bg-sky-50">
            <tr>
              {['Identitas Bunda', 'Kontak', 'Pendaftaran', 'Aksi'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400 font-bold">
                {search ? `Tidak ada bunda dengan nama "${search}"` : 'Belum ada data bunda.'}
              </td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-sky-50/50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-black text-xs shrink-0">
                      {getInitials(p.full_name)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{p.full_name || '-'}</p>
                      <p className="text-xs text-slate-400 font-semibold">{p.gender ? `Anak: ${p.gender}` : '-'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600 font-semibold">{p.phone || p.email?.split('@')[0]}</td>
                <td className="px-5 py-4 text-xs text-slate-400 font-semibold">
                  {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => selectPatient(p)} className="text-sky-600 font-bold text-sm hover:text-sky-700 flex items-center gap-1">
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

export default AdminDataBalita;

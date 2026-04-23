import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Save, X, Search, ChevronRight, ChevronLeft, Tablet, Clock, Activity, User, Eye, Ruler, Weight } from 'lucide-react';
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
  const [deleteModal, setDeleteModal] = useState(null); 
  const [activeTab, setActiveTab] = useState('data'); // 'data' | 'obat' | 'kepatuhan' | 'gejala'

  const fetchPatients = useCallback(async () => {
    setError('');
    try {
      const { data, error } = await supabase
        .from('profiles').select('*').eq('role', 'user').order('full_name');
      if (error) throw new Error('Gagal memuat data balita: ' + error.message);
      setPatients(data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const selectPatient = async (p) => {
    setSelected(p);
    setActiveTab('obat'); 
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
    } catch (err) { setError('Gagal memuat detail balita: ' + err.message); }
  };

  const openMedForm = (med = null) => {
    setEditMedId(med?.id || null);
    setMedForm(med ? { ...med, schedule_times: med.schedule_times || ['08:00'] } : { ...emptyMed, start_date: new Date().toISOString().split('T')[0] });
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

  if (selected) {
    return (
      <div>
        <button onClick={() => { setSelected(null); setShowMedForm(false); setError(''); }}
          className="flex items-center gap-2 text-sky-600 font-bold text-sm mb-6 hover:text-sky-700">
          <ChevronLeft size={18} /> Kembali ke Daftar
        </button>

        <div className="bg-gradient-to-br from-sky-50 to-cyan-50/40 rounded-3xl p-6 mb-6 border border-sky-100 shadow-nutrisea-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-600 to-cyan-400 flex items-center justify-center text-white font-black text-xl shadow-nutrisea-sm">
              {getInitials(selected.full_name)}
            </div>

            <div>
              <h2 className="text-2xl font-black text-sky-900">{selected.full_name || '-'}</h2>
              <p className="text-sky-500 font-semibold text-sm">{selected.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selected.gender && <Badge color="sky">{selected.gender}</Badge>}
                {selected.phone && <Badge color="slate">{selected.phone}</Badge>}
                {selected.allergy_info && <Badge color="red">Alergi: {selected.allergy_info}</Badge>}
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs font-black text-sky-400 uppercase mb-1">Kepatuhan</p>
              <p className={`text-3xl font-black ${patientCompliance >= 80 ? 'text-sky-600' : patientCompliance >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {patientCompliance}%
              </p>
            </div>
          </div>
        </div>

        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

        <div className="flex gap-1 bg-sky-50 p-1.5 rounded-2xl mb-6 overflow-x-auto hide-scrollbar border border-sky-100">
          {[
            { key: 'data', label: 'Data Balita' },
            { key: 'obat', label: `Jadwal Gummy (${patientMeds.length})` },
            { key: 'kepatuhan', label: `Log Konsumsi (${patientLogs.length})` },
            { key: 'gejala', label: `Tumbuh Kembang (${patientSymptoms.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === t.key ? 'bg-white text-sky-600 shadow-nutrisea-sm' : 'text-sky-300 hover:text-sky-500'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'data' && (
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-nutrisea-sm space-y-3">
            {[
              { label: 'Nama Lengkap', value: selected.full_name },
              { label: 'Email', value: selected.email },
              { label: 'Telepon Orang Tua', value: selected.phone || '-' },
              { label: 'Jenis Kelamin', value: selected.gender || '-' },
              { label: 'Tanggal Lahir', value: selected.date_of_birth ? new Date(selected.date_of_birth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
              { label: 'Alergi', value: selected.allergy_info || '-', danger: !!selected.allergy_info },
              { label: 'Status Profil', value: selected.is_profile_complete ? 'Lengkap' : 'Belum Lengkap' },
              { label: 'Terdaftar', value: new Date(selected.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-sky-50 last:border-0">
                <span className="text-sm font-black text-slate-400">{item.label}</span>
                <span className={`text-sm font-bold ${item.danger ? 'text-red-600' : 'text-slate-900'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'obat' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-slate-900">Program Gummy NutriSea</h4>
              <button onClick={() => openMedForm()}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition shadow-nutrisea-sm">
                <Plus size={14} /> Atur Jadwal
              </button>
            </div>

            {showMedForm && (
              <form onSubmit={saveMed} className="bg-sky-50/50 rounded-3xl p-6 border border-sky-100 mb-6 shadow-nutrisea-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-black text-sky-800">{editMedId ? 'Edit Jadwal' : 'Jadwal Baru'}</h5>
                  <button type="button" onClick={() => { setShowMedForm(false); setEditMedId(null); setError(''); }} className="text-sky-300 hover:text-sky-600"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Varian Gummy', name: 'name', placeholder: 'NutriSea Original', required: true },
                    { label: 'Dosis', name: 'dosage', placeholder: '1 Gummy', required: true },
                    { label: 'Frekuensi', name: 'frequency', placeholder: '1x sehari', required: true },
                    { label: 'Instruksi', name: 'instruction', placeholder: 'Sesudah makan pagi' },
                    { label: 'Tanggal Mulai', name: 'start_date', type: 'date', required: true },
                    { label: 'Tanggal Selesai', name: 'end_date', type: 'date' },
                    { label: 'Stok Gummy', name: 'total_tablets', type: 'number', placeholder: '30' },
                    { label: 'Catatan Admin', name: 'admin_notes', placeholder: 'Catatan khusus untuk bunda' },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 block">{f.label} {f.required && '*'}</label>
                      <input name={f.name} type={f.type || 'text'} placeholder={f.placeholder} value={medForm[f.name] || ''}
                        onChange={e => setMedForm(p => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full bg-white border-2 border-sky-100 rounded-xl px-4 py-2.5 text-slate-900 font-semibold text-sm focus:outline-none focus:border-sky-600" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Jam Pengingat <span className="font-semibold normal-case">(pisahkan dengan koma)</span></label>
                  <input type="text" value={medForm.schedule_times?.join(', ') || '08:00'}
                    onChange={e => setMedForm(p => ({ ...p, schedule_times: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                    className="w-full bg-white border-2 border-sky-100 rounded-xl px-4 py-2.5 text-slate-900 font-semibold text-sm focus:outline-none focus:border-sky-600" />
                </div>
                {error && <Alert type="error" message={error} />}
                <div className="flex gap-3">
                  <Button type="submit" disabled={saving} className="!w-auto px-8">
                    <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
                  </Button>
                  <button type="button" onClick={() => { setShowMedForm(false); setEditMedId(null); }}
                    className="px-6 py-2.5 bg-sky-100 text-sky-600 rounded-xl font-bold text-sm hover:bg-sky-200 transition">
                    Batal
                  </button>
                </div>
              </form>
            )}

            {patientMeds.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-sky-100 shadow-nutrisea-sm">
                <div className="text-5xl mb-3 text-sky-100">🌊</div>
                <p className="font-bold text-slate-400 text-sm">Belum ada jadwal gummy untuk balita ini.</p>
              </div>
            ) : patientMeds.map(med => (
              <div key={med.id} className={`bg-white rounded-3xl p-6 border-2 mb-4 transition-all shadow-nutrisea-sm ${med.is_active ? 'border-sky-50' : 'border-slate-50 opacity-60'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${med.is_active ? 'bg-sky-100' : 'bg-slate-100'}`}>
                      <Tablet size={22} className={med.is_active ? 'text-sky-600' : 'text-slate-400'} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg">{med.name} <span className="text-sky-600 font-bold">({med.dosage})</span></p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge color="sky">{med.frequency}</Badge>
                        {med.schedule_times?.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-sky-400" />
                            <span className="text-xs text-sky-500 font-bold">{med.schedule_times.join(' · ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => toggleMedStatus(med.id, med.is_active)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${med.is_active ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {med.is_active ? 'Aktif' : 'Off'}
                    </button>
                    <button onClick={() => openMedForm(med)} className="p-2 rounded-xl border border-sky-50 hover:bg-sky-50 text-sky-300 hover:text-sky-600 transition"><Edit3 size={16} /></button>
                    <button onClick={() => setDeleteModal({ id: med.id })} className="p-2 rounded-xl border border-red-50 hover:bg-red-50 text-red-200 hover:text-red-500 transition"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5 bg-sky-50/50 rounded-2xl p-4 border border-sky-50 text-xs">
                  <div><span className="text-slate-400 font-bold block mb-0.5">Instruksi</span><span className="font-bold text-slate-900">{med.instruction || '-'}</span></div>
                  <div><span className="text-slate-400 font-bold block mb-0.5">Stok</span><span className="font-bold text-sky-600">{med.remaining_tablets} Gummy</span></div>
                  <div><span className="text-slate-400 font-bold block mb-0.5">Selesai</span><span className="font-bold text-slate-900">{med.end_date ? new Date(med.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Selamanya'}</span></div>
                </div>
                {med.admin_notes && <p className="text-xs text-sky-700 font-semibold mt-3 pl-1 flex items-center gap-2 bg-sky-50 p-2 rounded-lg">✨ {med.admin_notes}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'kepatuhan' && (
          <div>
            <div className="bg-gradient-to-br from-sky-600 to-cyan-500 rounded-3xl p-6 mb-6 shadow-nutrisea text-white flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black">
                {patientCompliance}%
              </div>
              <div>
                <p className="font-black text-xl">Kepatuhan Konsumsi</p>
                <p className="text-white/80 text-sm font-semibold">{patientLogs.length} Gummy telah dikonsumsi bunda untuk si kecil.</p>
              </div>
            </div>
            {patientLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold">Belum ada riwayat konsumsi tercatat.</div>
            ) : (
              <div className="space-y-3">
                {patientLogs.map(log => (
                  <div key={log.id} className="bg-white rounded-2xl p-4 border border-sky-100 flex items-center justify-between shadow-nutrisea-sm">
                    <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full ${log.status === 'taken' ? 'bg-sky-500' : 'bg-red-400'}`} />
                       <div>
                          <p className="font-bold text-slate-900 text-sm">{log.medications?.name} ({log.medications?.dosage})</p>
                          <p className="text-xs text-slate-400 font-semibold">{new Date(log.taken_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                       </div>
                    </div>
                    <Badge color={log.status === 'taken' ? 'sky' : 'red'}>{log.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'gejala' && (
          <div className="space-y-4">
            {patientSymptoms.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold">Belum ada laporan tumbuh kembang.</div>
            ) : patientSymptoms.map(log => {
              return (
                <div key={log.id} className="bg-white rounded-3xl p-5 border border-sky-100 shadow-nutrisea-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                      {log.symptoms?.map((s, i) => <span key={i} className="text-[10px] bg-sky-100 text-sky-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">{s}</span>)}
                      {(!log.symptoms || log.symptoms.length === 0) && <span className="text-[10px] bg-sky-50 text-sky-400 px-3 py-1 rounded-full font-bold italic">Tanpa Gejala</span>}
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Kondisi</p>
                       <span className="font-black text-2xl text-sky-600">{log.severity}/10</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="bg-sky-50/50 rounded-2xl p-3 border border-sky-100 flex items-center gap-3">
                        <Ruler size={18} className="text-sky-600" />
                        <div>
                           <p className="text-[10px] text-slate-400 font-bold">Tinggi</p>
                           <p className="font-black text-slate-900">{log.height || '-'} <span className="text-xs font-normal">cm</span></p>
                        </div>
                     </div>
                     <div className="bg-sky-50/50 rounded-2xl p-3 border border-sky-100 flex items-center gap-3">
                        <Weight size={18} className="text-sky-600" />
                        <div>
                           <p className="text-[10px] text-slate-400 font-bold">Berat</p>
                           <p className="font-black text-slate-900">{log.weight || '-'} <span className="text-xs font-normal">kg</span></p>
                        </div>
                     </div>
                  </div>

                  {log.notes && <p className="text-xs font-semibold text-slate-600 bg-sky-50 rounded-xl p-3 mb-3">"{log.notes}"</p>}
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5"><Clock size={10} /> {new Date(log.created_at).toLocaleString('id-ID')}</p>
                </div>
              );
            })}
          </div>
        )}

        <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Jadwal Gummy?"
          footer={<><Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button><Button variant="danger" onClick={deleteMed}>Hapus</Button></>}>
          Jadwal ini akan dihapus permanen. Si Kecil tidak akan menerima notifikasi untuk jadwal ini lagi.
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-sky-600 to-cyan-500 rounded-3xl p-8 mb-6 shadow-nutrisea text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h3 className="text-3xl font-black tracking-tight mb-1">Data Balita</h3>
            <p className="text-white/80 font-semibold text-sm">{patients.length} si kecil terdaftar · Kelola gizi & pantau tumbuh kembang.</p>
          </div>
        </div>
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

      <div className="relative mb-6">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-sky-300" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama balita atau email bunda..."
          className="w-full bg-white border-2 border-sky-100 rounded-2xl pl-12 pr-6 py-4 text-slate-900 font-semibold text-sm focus:outline-none focus:border-sky-600 shadow-nutrisea-sm" />
      </div>

      <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-nutrisea">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sky-50">
              <tr>
                {['Profil Si Kecil', 'Orang Tua', 'Alergi', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-black text-sky-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sky-300 font-black">
                  {search ? `Tidak ditemukan "${search}"` : 'Belum ada balita yang terdaftar.'}
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-sky-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 font-extrabold text-xs shadow-sm group-hover:bg-sky-600 group-hover:text-white transition-all">
                        {getInitials(p.full_name)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{p.full_name || '-'}</p>
                        <p className="text-[10px] text-sky-400 font-bold uppercase">{p.gender || 'Belum diisi'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <p className="text-sm text-slate-600 font-bold">{p.phone || '-'}</p>
                     <p className="text-[10px] text-slate-400 font-semibold">{p.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    {p.allergy_info ? <Badge color="red">{p.allergy_info}</Badge> : <span className="text-slate-200 text-xs font-semibold">-</span>}
                  </td>
                  <td className="px-6 py-5">
                    <Badge color={p.is_profile_complete ? 'sky' : 'amber'}>{p.is_profile_complete ? 'Lengkap' : 'Menunggu'}</Badge>
                  </td>
                  <td className="px-6 py-5">
                    <button onClick={() => selectPatient(p)} className="flex items-center gap-1.5 text-sky-600 font-black text-sm hover:text-sky-800 transition">
                      Detail <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDataPasien;

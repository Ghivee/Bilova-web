import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Save, X, HelpCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, Modal, Button } from '../../components/UIComponents';

const emptyQ = { question: '', options: ['', '', '', ''], correct: 0, explanation: '', folder_name: 'Kuis Umum' };

const AdminKuis = () => {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyQ });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setError('');
    const { data, error } = await supabase.from('quiz_questions').select('*').order('created_at', { ascending: false });
    if (error) { setError('Gagal memuat soal kuis: ' + error.message); } else { setQuestions(data || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const openForm = (q = null) => {
    setEditId(q?.id || null);
    setForm(q ? {
      question: q.question,
      options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
      correct: q.correct || 0,
      explanation: q.explanation || '',
      folder_name: q.folder_name || 'Kuis Umum'
    } : { ...emptyQ });
    setError('');
    setShowForm(true);
  };

  const handleOptionChange = (i, val) => {
    setForm(p => { const o = [...p.options]; o[i] = val; return { ...p, options: o }; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim()) { setError('Soal tidak boleh kosong.'); return; }
    if (form.options.some(o => !o.trim())) { setError('Semua pilihan jawaban harus diisi.'); return; }
    if (form.correct < 0 || form.correct >= form.options.length) { setError('Pilihan kunci jawaban tidak valid.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { 
        folder_name: form.folder_name.trim() || 'Kuis Umum',
        question: form.question.trim(), 
        options: form.options, 
        correct: form.correct, 
        explanation: form.explanation || '', 
        author_id: profile?.id, 
        is_active: true 
      };
      const { error: err } = editId
        ? await supabase.from('quiz_questions').update(payload).eq('id', editId)
        : await supabase.from('quiz_questions').insert(payload);
      if (err) throw new Error(editId ? 'Gagal memperbarui soal: ' : 'Gagal menambah soal: ' + err.message);
      setShowForm(false); setEditId(null);
      await fetchQuestions();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const deleteQuestion = async () => {
    if (!deleteModal) return;
    const { error } = await supabase.from('quiz_questions').delete().eq('id', deleteModal);
    if (error) { setError('Gagal menghapus soal: ' + error.message); } else { setDeleteModal(null); await fetchQuestions(); }
  };

  const toggleActive = async (id, isActive) => {
    const { error } = await supabase.from('quiz_questions').update({ is_active: !isActive }).eq('id', id);
    if (error) setError('Gagal mengubah status: ' + error.message);
    else await fetchQuestions();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-[#EDD9F5] border-t-[#8B2C8C] rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="bg-gradient-to-br from-[#EDD9F5] to-[#D4A8E0]/40 rounded-2xl p-8 mb-6 border border-[#EDD9F5] flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black text-[#8B2C8C] tracking-tight mb-1">Manajemen Kuis</h3>
          <p className="text-[#6B4B7B] font-semibold text-sm">{questions.length} soal tersedia · {questions.filter(q => q.is_active).length} aktif</p>
        </div>
        <button onClick={() => openForm()}
          className="flex items-center gap-2 px-5 py-3 bg-[#8B2C8C] text-white rounded-xl font-bold shadow-bilova-sm hover:bg-[#6B1B6C] transition">
          <Plus size={16} /> Tambah Soal
        </button>
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#EDD9F5]/30 rounded-2xl p-6 border border-[#EDD9F5] mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-black text-[#2D1B3D]">{editId ? 'Edit Soal' : 'Soal Baru'}</h4>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setError(''); }}><X size={18} className="text-[#B090C0]" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-1.5 block">Folder / Judul Kuis</label>
              <input value={form.folder_name} onChange={e => setForm(p => ({ ...p, folder_name: e.target.value }))}
                placeholder="Misal: Kuis Dasar 1, Minggu 1, dll..."
                className="w-full bg-white border-2 border-[#EDD9F5] rounded-xl px-4 py-3 text-[#2D1B3D] font-bold text-sm focus:outline-none focus:border-[#8B2C8C] shadow-sm mb-2" />
            </div>

            <div>
              <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-1.5 block">Pertanyaan *</label>
              <textarea value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                placeholder="Tulis soal pertanyaan di sini..." rows={3}
                className="w-full bg-white border-2 border-[#EDD9F5] rounded-xl px-4 py-3 text-[#2D1B3D] font-semibold text-sm resize-none focus:outline-none focus:border-[#8B2C8C]" />
            </div>

            <div>
              <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-2 block">Pilihan Jawaban *</label>
              <p className="text-xs text-[#B090C0] font-semibold mb-2">Pilih radio button untuk menandai jawaban benar.</p>
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3 mb-2">
                  <button type="button" onClick={() => setForm(p => ({ ...p, correct: i }))}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${form.correct === i ? 'bg-[#8B2C8C] border-[#8B2C8C]' : 'border-[#D4A8E0]'}`}>
                    {form.correct === i && <div className="w-3 h-3 rounded-full bg-white" />}
                  </button>
                  <input value={opt} onChange={e => handleOptionChange(i, e.target.value)}
                    placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                    className="flex-1 bg-white border-2 border-[#EDD9F5] rounded-xl px-3 py-2 text-[#2D1B3D] font-semibold text-sm focus:outline-none focus:border-[#8B2C8C]" />
                  <span className={`text-xs font-black px-2 py-1 rounded-full ${form.correct === i ? 'bg-[#EDD9F5] text-[#8B2C8C]' : 'text-[#D4A8E0]'}`}>
                    {form.correct === i ? 'BENAR' : String.fromCharCode(65 + i)}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-1.5 block">Penjelasan Jawaban <span className="text-[#B090C0] font-semibold normal-case">(opsional)</span></label>
              <textarea value={form.explanation} onChange={e => setForm(p => ({ ...p, explanation: e.target.value }))}
                placeholder="Jelaskan mengapa jawaban ini benar..." rows={2}
                className="w-full bg-white border-2 border-[#EDD9F5] rounded-xl px-4 py-3 text-[#2D1B3D] font-semibold text-sm resize-none focus:outline-none focus:border-[#8B2C8C]" />
            </div>
          </div>

          {error && <div className="mt-3"><Alert type="error" message={error} /></div>}

          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#8B2C8C] text-white rounded-xl font-bold text-sm hover:bg-[#6B1B6C] disabled:opacity-50 transition">
              <Save size={14} /> {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Soal'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setError(''); }}
              className="px-6 py-2.5 bg-[#EDD9F5] text-[#8B2C8C] rounded-xl font-bold text-sm hover:bg-[#D4A8E0] transition">Batal</button>
          </div>
        </form>
      )}

      {/* List */}
      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#EDD9F5]">
          <HelpCircle size={40} className="text-[#D4A8E0] mx-auto mb-3" />
          <p className="font-bold text-[#B090C0]">Belum ada soal kuis. Tambahkan soal pertama!</p>
        </div>
      ) : (
        Object.entries(
          questions.reduce((acc, q) => {
            const folder = q.folder_name || 'Kuis Umum';
            acc[folder] = acc[folder] || [];
            acc[folder].push(q);
            return acc;
          }, {})
        ).map(([folder, folderQs]) => (
          <div key={folder} className="mb-8">
            <div className="flex items-center gap-3 mb-4 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#EDD9F5] flex items-center justify-center text-[#8B2C8C]">📁</div>
              <h4 className="font-black text-[#6B1B6C] text-lg">{folder}</h4>
              <span className="text-xs font-bold text-[#B090C0] bg-white border border-[#EDD9F5] px-2 py-0.5 rounded-md shadow-sm">{folderQs.length} Soal</span>
            </div>
            
            <div className="space-y-3">
              {folderQs.map((q, idx) => (
                <div key={q.id} className={`bg-white rounded-2xl p-5 border-2 ${q.is_active ? 'border-[#EDD9F5]' : 'border-slate-100 opacity-70'}`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 rounded-xl ${q.is_active ? 'bg-[#EDD9F5] text-[#8B2C8C]' : 'bg-slate-100 text-slate-400'} font-black text-xs flex items-center justify-center shrink-0 mt-0.5`}>{idx + 1}</span>
                      <p className={`font-bold text-sm leading-relaxed ${q.is_active ? 'text-[#2D1B3D]' : 'text-slate-500'}`}>{q.question}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleActive(q.id, q.is_active)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black ${q.is_active ? 'bg-[#EDD9F5] text-[#8B2C8C]' : 'bg-slate-100 text-slate-500'}`}>
                        {q.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                      <button onClick={() => openForm(q)} className="p-1.5 rounded-xl hover:bg-[#EDD9F5] text-[#B090C0] hover:text-[#8B2C8C] transition"><Edit3 size={14} /></button>
                      <button onClick={() => setDeleteModal(q.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-[#B090C0] hover:text-red-600 transition"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 ml-10">
                    {(Array.isArray(q.options) ? q.options : []).map((opt, i) => (
                      <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${i === q.correct ? (q.is_active ? 'bg-[#EDD9F5] border-[#8B2C8C] text-[#8B2C8C]' : 'bg-slate-200 border-slate-300 text-slate-500') : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                         <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${i === q.correct ? (q.is_active ? 'bg-[#8B2C8C] text-white' : 'bg-slate-400 text-white') : 'bg-slate-200 text-slate-500'}`}>{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  {q.explanation && <p className="text-xs text-[#6B4B7B] font-semibold bg-[#EDD9F5]/40 rounded-xl px-3 py-2 mt-2 ml-10">💡 {q.explanation}</p>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Soal?"
        footer={<><Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button><Button variant="danger" onClick={deleteQuestion}>Hapus</Button></>}>
        Soal ini akan dihapus permanen dan tidak muncul lagi di kuis pengguna.
      </Modal>
    </div>
  );
};

export default AdminKuis;

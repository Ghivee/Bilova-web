import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Save, X, HelpCircle, BookOpen, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, Modal, Button } from '../../components/UIComponents';

const emptyQ = { question: '', options: ['', '', '', ''], correct: 0, explanation: '', folder_name: 'Edukasi Umum' };

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
    if (error) { setError('Gagal memuat materi kuis: ' + error.message); } else { setQuestions(data || []); }
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
      folder_name: q.folder_name || 'Edukasi Umum'
    } : { ...emptyQ });
    setError('');
    setShowForm(true);
  };

  const handleOptionChange = (i, val) => {
    setForm(p => { const o = [...p.options]; o[i] = val; return { ...p, options: o }; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim()) { setError('Pertanyaan tidak boleh kosong.'); return; }
    if (form.options.some(o => !o.trim())) { setError('Semua pilihan jawaban harus diisi.'); return; }
    if (form.correct < 0 || form.correct >= form.options.length) { setError('Kunci jawaban tidak valid.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { 
        folder_name: form.folder_name.trim() || 'Edukasi Umum',
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
      if (err) throw new Error(editId ? 'Gagal memperbarui: ' : 'Gagal menambah: ' + err.message);
      setShowForm(false); setEditId(null);
      await fetchQuestions();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const deleteQuestion = async () => {
    if (!deleteModal) return;
    const { error } = await supabase.from('quiz_questions').delete().eq('id', deleteModal);
    if (error) { setError('Gagal menghapus: ' + error.message); } else { setDeleteModal(null); await fetchQuestions(); }
  };

  const toggleActive = async (id, isActive) => {
    const { error } = await supabase.from('quiz_questions').update({ is_active: !isActive }).eq('id', id);
    if (error) setError('Gagal mengubah status: ' + error.message);
    else await fetchQuestions();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="bg-gradient-to-br from-sky-600 to-cyan-500 rounded-3xl p-8 mb-6 shadow-nutrisea text-white flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black tracking-tight mb-1">Manajemen Edukasi</h3>
          <p className="text-white/80 font-semibold text-sm">{questions.length} materi tersedia · {questions.filter(q => q.is_active).length} aktif</p>
        </div>
        <button onClick={() => openForm()}
          className="flex items-center gap-2 px-6 py-3 bg-white text-sky-600 rounded-xl font-bold shadow-nutrisea-sm hover:scale-105 transition-all">
          <Plus size={18} /> Tambah Materi
        </button>
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-sky-50/50 rounded-3xl p-6 border border-sky-100 mb-6 shadow-nutrisea-sm animate-fadeIn">
          <div className="flex justify-between items-center mb-5">
            <h4 className="font-black text-sky-900">{editId ? 'Edit Materi Edukasi' : 'Materi Edukasi Baru'}</h4>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setError(''); }} className="text-sky-300 hover:text-sky-600 transition-colors"><X size={22} /></button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Kategori / Folder</label>
              <input value={form.folder_name} onChange={e => setForm(p => ({ ...p, folder_name: e.target.value }))}
                placeholder="Misal: Nutrisi Dasar, Gizi Ibu Hamil, dll..."
                className="w-full bg-white border-2 border-sky-100 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-sky-600 shadow-sm" />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Pertanyaan Kuis *</label>
              <textarea value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                placeholder="Tulis pertanyaan edukasi di sini..." rows={3}
                className="w-full bg-white border-2 border-sky-100 rounded-xl px-4 py-3 text-slate-900 font-semibold text-sm resize-none focus:outline-none focus:border-sky-600 shadow-sm" />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Opsi Jawaban *</label>
              <p className="text-[10px] text-sky-400 font-bold mb-3 uppercase tracking-wider">Pilih lingkaran untuk menandai jawaban yang benar.</p>
              <div className="space-y-3">
                 {form.options.map((opt, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <button type="button" onClick={() => setForm(p => ({ ...p, correct: i }))}
                       className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${form.correct === i ? 'bg-sky-600 border-sky-600' : 'border-sky-100 bg-white hover:border-sky-300'}`}>
                       {form.correct === i && <div className="w-3 h-3 rounded-full bg-white" />}
                     </button>
                     <input value={opt} onChange={e => handleOptionChange(i, e.target.value)}
                       placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                       className="flex-1 bg-white border-2 border-sky-100 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm focus:outline-none focus:border-sky-600 shadow-sm" />
                   </div>
                 ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Penjelasan Jawaban <span className="text-sky-300 font-semibold normal-case">(opsional)</span></label>
              <textarea value={form.explanation} onChange={e => setForm(p => ({ ...p, explanation: e.target.value }))}
                placeholder="Berikan edukasi singkat mengapa jawaban tersebut benar..." rows={2}
                className="w-full bg-white border-2 border-sky-100 rounded-xl px-4 py-3 text-slate-900 font-semibold text-sm resize-none focus:outline-none focus:border-sky-600 shadow-sm" />
            </div>
          </div>

          {error && <div className="mt-4"><Alert type="error" message={error} /></div>}

          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={saving} className="!w-auto px-10">
              <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Materi'}
            </Button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setError(''); }}
              className="px-8 py-3 bg-sky-100 text-sky-600 rounded-full font-bold text-sm hover:bg-sky-200 transition-colors">Batal</button>
          </div>
        </form>
      )}

      {questions.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-sky-100 shadow-nutrisea-sm">
          <HelpCircle size={50} className="text-sky-100 mx-auto mb-4" />
          <p className="font-black text-slate-400">Belum ada materi edukasi. Mulai tambahkan sekarang!</p>
        </div>
      ) : (
        Object.entries(
          questions.reduce((acc, q) => {
            const folder = q.folder_name || 'Edukasi Umum';
            acc[folder] = acc[folder] || [];
            acc[folder].push(q);
            return acc;
          }, {})
        ).map(([folder, folderQs]) => (
          <div key={folder} className="mb-10">
            <div className="flex items-center gap-3 mb-5 px-1">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 shadow-sm">
                 <BookOpen size={20} />
              </div>
              <h4 className="font-black text-slate-900 text-xl">{folder}</h4>
              <span className="text-[10px] font-black text-sky-500 bg-white border border-sky-100 px-3 py-1 rounded-full shadow-sm">{folderQs.length} MATERI</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {folderQs.map((q, idx) => (
                <div key={q.id} className={`bg-white rounded-3xl p-6 border-2 transition-all shadow-nutrisea-sm ${q.is_active ? 'border-sky-50' : 'border-slate-50 opacity-60'}`}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className={`w-8 h-8 rounded-xl ${q.is_active ? 'bg-sky-600 text-white shadow-nutrisea-sm' : 'bg-slate-100 text-slate-400'} font-black text-xs flex items-center justify-center shrink-0 mt-0.5`}>{idx + 1}</span>
                      <p className={`font-black text-sm leading-relaxed ${q.is_active ? 'text-slate-900' : 'text-slate-400'}`}>{q.question}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleActive(q.id, q.is_active)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${q.is_active ? 'bg-sky-50 text-sky-600' : 'bg-slate-50 text-slate-400'}`}>
                        {q.is_active ? 'Aktif' : 'Off'}
                      </button>
                      <button onClick={() => openForm(q)} className="p-2 rounded-xl hover:bg-sky-50 text-slate-300 hover:text-sky-600 transition-colors"><Edit3 size={16} /></button>
                      <button onClick={() => setDeleteModal(q.id)} className="p-2 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-11">
                    {(Array.isArray(q.options) ? q.options : []).map((opt, i) => (
                      <div key={i} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${i === q.correct ? (q.is_active ? 'bg-sky-50 border-sky-600 text-sky-700 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-500') : 'bg-white border-sky-50 text-slate-500'}`}>
                         <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${i === q.correct ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-500'}`}>{String.fromCharCode(65 + i)}</span>
                         <span className="truncate">{opt}</span>
                         {i === q.correct && <CheckCircle2 size={14} className="ml-auto shrink-0" />}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                     <div className="mt-4 ml-11 bg-sky-50/50 rounded-2xl p-4 border border-sky-50">
                        <p className="text-xs text-sky-700 font-bold flex items-start gap-2 leading-relaxed">
                           <span className="shrink-0 text-lg">💡</span> 
                           {q.explanation}
                        </p>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Materi Edukasi?"
        footer={<><Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button><Button variant="danger" onClick={deleteQuestion}>Hapus</Button></>}>
        Materi ini akan dihapus permanen dari sistem dan tidak muncul lagi di kuis bunda.
      </Modal>
    </div>
  );
};

export default AdminKuis;

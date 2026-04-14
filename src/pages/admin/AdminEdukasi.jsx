import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Save, X, Eye, EyeOff, Lightbulb, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, Modal, Button, Badge } from '../../components/UIComponents';

const emptyArticle = { title: '', content: '', category: 'umum', is_published: true };
const emptyTip = { content: '', is_active: true };
const categories = ['umum', 'antibiotic', 'resistansi', 'efek-samping', 'nutrisi'];

const AdminEdukasi = () => {
  const { profile } = useAuth();
  const [tab, setTab] = useState('articles'); // 'articles' | 'tips'
  const [articles, setArticles] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyArticle });
  const [tipForm, setTipForm] = useState({ ...emptyTip });
  const [editTipId, setEditTipId] = useState(null);
  const [showTipForm, setShowTipForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchAll = useCallback(async () => {
    setError('');
    try {
      const [artRes, tipRes] = await Promise.all([
        supabase.from('educational_articles').select('*').order('created_at', { ascending: false }),
        supabase.from('daily_tips').select('*').order('created_at', { ascending: false })
      ]);
      if (artRes.error) throw new Error('Gagal memuat artikel: ' + artRes.error.message);
      if (tipRes.error && tipRes.error.code !== '42P01') throw new Error('Gagal memuat tips: ' + tipRes.error.message);
      setArticles(artRes.data || []);
      setTips(tipRes.data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openArticleForm = (a = null) => {
    setEditId(a?.id || null);
    setForm(a ? { title: a.title, content: a.content, category: a.category, is_published: a.is_published } : { ...emptyArticle });
    setShowForm(true); setError('');
  };

  const saveArticle = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Judul artikel wajib diisi.'); return; }
    if (!form.content.trim()) { setError('Konten artikel wajib diisi.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, author_id: profile?.id };
      const { error: err } = editId
        ? await supabase.from('educational_articles').update(payload).eq('id', editId)
        : await supabase.from('educational_articles').insert(payload);
      if (err) throw new Error((editId ? 'Gagal memperbarui' : 'Gagal menambah') + ' artikel: ' + err.message);
      setShowForm(false); setEditId(null);
      await fetchAll();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const togglePublish = async (id, cur) => {
    const { error } = await supabase.from('educational_articles').update({ is_published: !cur }).eq('id', id);
    if (error) setError('Gagal mengubah status: ' + error.message);
    else fetchAll();
  };

  const deleteItem = async () => {
    if (!deleteModal) return;
    const table = deleteModal.type === 'article' ? 'educational_articles' : 'daily_tips';
    const { error } = await supabase.from(table).delete().eq('id', deleteModal.id);
    if (error) setError('Gagal menghapus: ' + error.message);
    else { setDeleteModal(null); fetchAll(); }
  };

  // TIPS CRUD
  const openTipForm = (t = null) => {
    setEditTipId(t?.id || null);
    setTipForm(t ? { content: t.content, is_active: t.is_active } : { ...emptyTip });
    setShowTipForm(true); setError('');
  };

  const saveTip = async (e) => {
    e.preventDefault();
    if (!tipForm.content.trim()) { setError('Konten tips wajib diisi.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...tipForm, author_id: profile?.id };
      const { error: err } = editTipId
        ? await supabase.from('daily_tips').update(payload).eq('id', editTipId)
        : await supabase.from('daily_tips').insert(payload);
      if (err) throw new Error((editTipId ? 'Gagal memperbarui' : 'Gagal menambah') + ' tips: ' + err.message);
      setShowTipForm(false); setEditTipId(null);
      await fetchAll();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-[#EDD9F5] border-t-[#8B2C8C] rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="bg-gradient-to-br from-[#EDD9F5] to-[#D4A8E0]/40 rounded-2xl p-8 mb-6 border border-[#EDD9F5]">
        <h3 className="text-3xl font-black text-[#8B2C8C] tracking-tight mb-1">Edukasi & Konten</h3>
        <p className="text-[#6B4B7B] font-semibold text-sm">Kelola artikel edukasi dan tips harian untuk pengguna BiLova.</p>
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#EDD9F5]/50 p-1 rounded-2xl mb-5 w-fit">
        <button onClick={() => { setTab('articles'); setShowForm(false); setShowTipForm(false); }}
          className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'articles' ? 'bg-white text-[#8B2C8C] shadow-card' : 'text-[#B090C0]'}`}>
          <BookOpen size={14} className="inline mr-1.5" />Artikel ({articles.length})
        </button>
        <button onClick={() => { setTab('tips'); setShowForm(false); setShowTipForm(false); }}
          className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'tips' ? 'bg-white text-[#8B2C8C] shadow-card' : 'text-[#B090C0]'}`}>
          <Lightbulb size={14} className="inline mr-1.5" />Tips Harian ({tips.length})
        </button>
      </div>

      {/* ─── ARTICLES TAB ─── */}
      {tab === 'articles' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => openArticleForm()} className="flex items-center gap-2 px-5 py-2.5 bg-[#8B2C8C] text-white rounded-xl font-bold text-sm hover:bg-[#6B1B6C] transition shadow-bilova-sm">
              <Plus size={14} /> Tambah Artikel
            </button>
          </div>

          {showForm && (
            <form onSubmit={saveArticle} className="bg-[#EDD9F5]/30 rounded-2xl p-6 border border-[#EDD9F5] mb-5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-[#2D1B3D]">{editId ? 'Edit Artikel' : 'Artikel Baru'}</h4>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); setError(''); }}><X size={18} className="text-[#B090C0]" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-1.5 block">Judul *</label>
                  <input name="title" value={form.title} onChange={handle} placeholder="Judul artikel..."
                    className="w-full bg-white border-2 border-[#EDD9F5] rounded-xl px-4 py-3 text-[#2D1B3D] font-semibold text-sm focus:outline-none focus:border-[#8B2C8C]" />
                </div>
                <div>
                  <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-1.5 block">Kategori</label>
                  <select name="category" value={form.category} onChange={handle}
                    className="w-full bg-white border-2 border-[#EDD9F5] rounded-xl px-4 py-3 text-[#2D1B3D] font-semibold text-sm focus:outline-none focus:border-[#8B2C8C]">
                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-1.5 block">Konten *</label>
                  <textarea name="content" value={form.content} onChange={handle} rows={8} placeholder="Tulis konten artikel..."
                    className="w-full bg-white border-2 border-[#EDD9F5] rounded-xl px-4 py-3 text-[#2D1B3D] font-semibold text-sm resize-none focus:outline-none focus:border-[#8B2C8C]" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#8B2C8C] text-white rounded-xl font-bold text-sm hover:bg-[#6B1B6C] disabled:opacity-50 transition">
                  <Save size={14} /> {saving ? 'Menyimpan...' : editId ? 'Simpan' : 'Publikasikan'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); setError(''); }}
                  className="px-6 py-2.5 bg-[#EDD9F5] text-[#8B2C8C] rounded-xl font-bold text-sm hover:bg-[#D4A8E0] transition">Batal</button>
              </div>
            </form>
          )}

          {articles.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#EDD9F5]">
              <BookOpen size={40} className="text-[#D4A8E0] mx-auto mb-3" />
              <p className="font-bold text-[#B090C0]">Belum ada artikel. Tambahkan artikel pertama!</p>
            </div>
          ) : articles.map(a => (
            <div key={a.id} className={`bg-white rounded-2xl p-5 mb-3 border-2 ${a.is_published ? 'border-[#EDD9F5]' : 'border-slate-100 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge>{a.category || 'umum'}</Badge>
                    <Badge color={a.is_published ? 'green' : 'slate'}>{a.is_published ? 'Dipublikasikan' : 'Draf'}</Badge>
                  </div>
                  <h4 className="font-black text-[#2D1B3D]">{a.title}</h4>
                  <p className="text-xs text-[#B090C0] font-semibold mt-1 line-clamp-2">{a.content.substring(0, 120)}...</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => togglePublish(a.id, a.is_published)} className="p-1.5 rounded-xl hover:bg-[#EDD9F5] text-[#B090C0] hover:text-[#8B2C8C] transition">
                    {a.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => openArticleForm(a)} className="p-1.5 rounded-xl hover:bg-[#EDD9F5] text-[#B090C0] hover:text-[#8B2C8C] transition"><Edit3 size={14} /></button>
                  <button onClick={() => setDeleteModal({ id: a.id, type: 'article' })} className="p-1.5 rounded-xl hover:bg-red-50 text-[#B090C0] hover:text-red-600 transition"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TIPS TAB ─── */}
      {tab === 'tips' && (
        <div>
          <div className="bg-[#EDD9F5]/50 rounded-2xl p-4 mb-4 border border-[#EDD9F5] flex items-start gap-3">
            <Lightbulb size={20} className="text-[#8B2C8C] mt-0.5 shrink-0" />
            <p className="text-sm text-[#6B4B7B] font-semibold">Tips harian muncul di halaman <strong>Beranda</strong> pengguna sebagai motivasi dan informasi edukasi. Hanya 1 tip terbaru yang ditampilkan.</p>
          </div>

          <div className="flex justify-end mb-4">
            <button onClick={() => openTipForm()} className="flex items-center gap-2 px-5 py-2.5 bg-[#8B2C8C] text-white rounded-xl font-bold text-sm hover:bg-[#6B1B6C] transition shadow-bilova-sm">
              <Plus size={14} /> Tambah Tips
            </button>
          </div>

          {showTipForm && (
            <form onSubmit={saveTip} className="bg-[#EDD9F5]/30 rounded-2xl p-6 border border-[#EDD9F5] mb-5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-[#2D1B3D]">{editTipId ? 'Edit Tips' : 'Tips Baru'}</h4>
                <button type="button" onClick={() => { setShowTipForm(false); setEditTipId(null); setError(''); }}><X size={18} className="text-[#B090C0]" /></button>
              </div>
              <div>
                <label className="text-xs font-black text-[#6B4B7B] uppercase tracking-wider mb-1.5 block">Konten Tips *</label>
                <textarea value={tipForm.content} onChange={e => setTipForm(p => ({ ...p, content: e.target.value }))} rows={4}
                  placeholder="Tulis tips edukasi singkat yang bermanfaat untuk pengguna..."
                  className="w-full bg-white border-2 border-[#EDD9F5] rounded-xl px-4 py-3 text-[#2D1B3D] font-semibold text-sm resize-none focus:outline-none focus:border-[#8B2C8C]" />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#8B2C8C] text-white rounded-xl font-bold text-sm hover:bg-[#6B1B6C] disabled:opacity-50 transition">
                  <Save size={14} /> {saving ? 'Menyimpan...' : editTipId ? 'Simpan' : 'Tambah Tips'}
                </button>
                <button type="button" onClick={() => { setShowTipForm(false); setEditTipId(null); setError(''); }}
                  className="px-6 py-2.5 bg-[#EDD9F5] text-[#8B2C8C] rounded-xl font-bold text-sm hover:bg-[#D4A8E0] transition">Batal</button>
              </div>
            </form>
          )}

          {tips.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#EDD9F5]">
              <Lightbulb size={40} className="text-[#D4A8E0] mx-auto mb-3" />
              <p className="font-bold text-[#B090C0]">Belum ada tips. Tambahkan tips pertama!</p>
            </div>
          ) : tips.map((t, idx) => (
            <div key={t.id} className={`bg-white rounded-2xl p-5 mb-3 border-2 ${t.is_active ? 'border-[#EDD9F5]' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${idx === 0 ? 'bg-[#8B2C8C]' : 'bg-[#EDD9F5]'}`}>
                    <Lightbulb size={14} className={idx === 0 ? 'text-white' : 'text-[#8B2C8C]'} />
                  </div>
                  <div>
                    {idx === 0 && t.is_active && <span className="text-[10px] font-black text-[#8B2C8C] bg-[#EDD9F5] px-2 py-0.5 rounded-full block w-fit mb-1">DITAMPILKAN SEKARANG</span>}
                    <p className="text-sm font-semibold text-[#2D1B3D] leading-relaxed">{t.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openTipForm(t)} className="p-1.5 rounded-xl hover:bg-[#EDD9F5] text-[#B090C0] hover:text-[#8B2C8C] transition"><Edit3 size={14} /></button>
                  <button onClick={() => setDeleteModal({ id: t.id, type: 'tip' })} className="p-1.5 rounded-xl hover:bg-red-50 text-[#B090C0] hover:text-red-600 transition"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title={`Hapus ${deleteModal?.type === 'article' ? 'Artikel' : 'Tips'}?`}
        footer={<><Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button><Button variant="danger" onClick={deleteItem}>Hapus</Button></>}>
        {deleteModal?.type === 'article' ? 'Artikel ini akan dihapus permanen.' : 'Tips ini akan dihapus dan tidak muncul di beranda pengguna.'}
      </Modal>
    </div>
  );
};

export default AdminEdukasi;

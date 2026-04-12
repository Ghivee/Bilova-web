import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit3, Save, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const AdminEdukasi = () => {
    const { profile } = useAuth();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', category: 'umum' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const categories = ['umum', 'antibiotik', 'resistansi', 'pencegahan', 'tips'];

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const { data, error } = await supabase
                .from('educational_articles')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (data) setArticles(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) {
            setError('Judul dan konten wajib diisi.');
            return;
        }
        setError('');
        setSaving(true);
        try {
            if (editingId) {
                const { error } = await supabase
                    .from('educational_articles')
                    .update({
                        title: form.title,
                        content: form.content,
                        category: form.category
                    })
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('educational_articles')
                    .insert({
                        title: form.title,
                        content: form.content,
                        category: form.category,
                        author_id: profile?.id,
                        is_published: true
                    });
                if (error) throw error;
            }
            resetForm();
            fetchArticles();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (article) => {
        setForm({ title: article.title, content: article.content, category: article.category || 'umum' });
        setEditingId(article.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus artikel ini?')) return;
        try {
            const { error } = await supabase.from('educational_articles').delete().eq('id', id);
            if (error) throw error;
            fetchArticles();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const togglePublish = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('educational_articles')
                .update({ is_published: !currentStatus })
                .eq('id', id);
            if (error) throw error;
            fetchArticles();
        } catch (err) {
            console.error('Toggle error:', err);
        }
    };

    const resetForm = () => {
        setForm({ title: '', content: '', category: 'umum' });
        setEditingId(null);
        setShowForm(false);
        setError('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 mb-8 border border-emerald-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-3xl font-extrabold text-emerald-900 tracking-tight mb-2">Edukasi & Artikel</h3>
                    <p className="text-emerald-700/70 text-base">Kelola konten edukasi untuk pengguna BILOVA.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                >
                    <Plus size={18} /> Tambah Artikel
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-bold text-slate-900">
                            {editingId ? 'Edit Artikel' : 'Buat Artikel Baru'}
                        </h4>
                        <button onClick={resetForm} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500">
                            <X size={20} />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Judul Artikel</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Masukkan judul artikel..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Kategori</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            >
                                {categories.map(c => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Konten</label>
                            <textarea
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                placeholder="Tulis konten artikel..."
                                rows={8}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium resize-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                                <Save size={16} />
                                {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Publikasikan'}
                            </button>
                            <button type="button" onClick={resetForm} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition">
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Articles List */}
            <div className="space-y-4">
                {articles.map((article) => (
                    <div key={article.id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg uppercase">
                                        {article.category || 'Umum'}
                                    </span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${article.is_published ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {article.is_published ? 'Dipublikasi' : 'Draft'}
                                    </span>
                                </div>
                                <h4 className="font-bold text-lg text-slate-900 mb-1">{article.title}</h4>
                                <p className="text-sm text-slate-500 line-clamp-2">{article.content}</p>
                                <p className="text-xs text-slate-400 mt-2">
                                    {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => togglePublish(article.id, article.is_published)}
                                    className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-slate-600"
                                    title={article.is_published ? 'Sembunyikan' : 'Publikasi'}
                                >
                                    {article.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                    onClick={() => handleEdit(article)}
                                    className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-emerald-600"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(article.id)}
                                    className="p-2 rounded-xl hover:bg-red-50 transition text-slate-400 hover:text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {articles.length === 0 && (
                    <div className="bg-slate-50 rounded-2xl p-12 text-center">
                        <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Belum ada artikel edukasi.</p>
                        <p className="text-sm text-slate-400 mt-1">Klik "Tambah Artikel" untuk memulai.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminEdukasi;

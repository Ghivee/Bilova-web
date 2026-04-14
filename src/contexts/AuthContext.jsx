import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan dalam AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        if (error.code !== 'PGRST116') console.error('Fetch profil error:', error);
        return null;
      }
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error mengambil profil:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Safety timeout — jika Supabase tidak merespons
    const timeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [fetchProfile]);

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'user' } }
    });
    if (error) {
      if (error.message?.includes('already registered')) throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau masuk.');
      if (error.message?.includes('Password')) throw new Error('Password terlalu lemah. Gunakan minimal 8 karakter.');
      throw new Error(error.message || 'Gagal mendaftar. Coba lagi.');
    }
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message?.includes('Invalid login credentials')) throw new Error('Email atau password salah. Periksa kembali data Anda.');
      if (error.message?.includes('Email not confirmed')) throw new Error('Email belum diverifikasi. Cek kotak masuk email Anda.');
      if (error.message?.includes('Too many requests')) throw new Error('Terlalu banyak percobaan masuk. Tunggu beberapa menit.');
      throw new Error(error.message || 'Gagal masuk. Coba lagi.');
    }
    return data;
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    try { await supabase.auth.signOut(); } catch { /* silent */ }
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/Bilova-web/reset-password`
    });
    if (error) {
      if (error.message?.includes('not found')) throw new Error('Email tidak ditemukan. Pastikan email sudah terdaftar.');
      throw new Error(error.message || 'Gagal mengirim email reset password.');
    }
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('Sesi tidak ditemukan. Silakan masuk kembali.');
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw new Error('Gagal memperbarui profil: ' + error.message);
    setProfile(data);
    return data;
  };

  const isAdmin = profile?.role?.toLowerCase() === 'admin' || profile?.role?.toLowerCase() === 'superadmin';
  // Profile dianggap lengkap jika ada nama dan tanggal lahir (atau flag is_profile_complete)
  const isProfileComplete = !!(profile?.is_profile_complete || (profile?.full_name && profile?.phone && profile?.gender));

  const value = {
    user, profile, loading,
    signUp, signIn, signOut, resetPassword, updateProfile, fetchProfile,
    isAdmin, isAuthenticated: !!user, isProfileComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

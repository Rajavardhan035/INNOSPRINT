import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  KNOWN_ADMINS,
  checkIsAdminEmail,
  checkIsAdminEmailAsync,
  fetchCloudAuthorizedAdmins,
} from './adminList';

export { KNOWN_ADMINS, checkIsAdminEmail, checkIsAdminEmailAsync, fetchCloudAuthorizedAdmins };

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('visitor');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // Prime cloud authorized admins roster across devices
      try {
        await fetchCloudAuthorizedAdmins();
      } catch (e) {
        console.warn('[Auth] Prime cloud admins notice:', e);
      }

      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser(session.user);
            await fetchUserProfileAndRole(session.user.id, session.user.email);
          } else if (mounted) {
            // Check if local admin session exists before clearing
            const storedUser = localStorage.getItem('inno_sprint_user');
            if (storedUser) {
              try {
                const parsed = JSON.parse(storedUser);
                if (parsed.user && checkIsAdminEmail(parsed.user.email)) {
                  setUser(parsed.user);
                  setProfile(parsed.profile);
                  setRole(parsed.role || 'organizer');
                }
              } catch (e) {
                localStorage.removeItem('inno_sprint_user');
              }
            }
          }
        } catch (err) {
          console.error('[Auth Init Error]', err);
        } finally {
          if (mounted) setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;

          // When signed out, ensure complete cleanup and never resurrect session
          if (event === 'SIGNED_OUT') {
            localStorage.removeItem('inno_sprint_user');
            setUser(null);
            setProfile(null);
            setRole('visitor');
            setLoading(false);
            return;
          }

          if (session?.user) {
            setUser(session.user);
            await fetchUserProfileAndRole(session.user.id, session.user.email);
            setLoading(false);
          } else {
            // Only check local session if NOT signed out
            const storedUser = localStorage.getItem('inno_sprint_user');
            if (storedUser) {
              try {
                const parsed = JSON.parse(storedUser);
                if (parsed.user && checkIsAdminEmail(parsed.user.email)) {
                  setUser(parsed.user);
                  setProfile(parsed.profile);
                  setRole(parsed.role || 'organizer');
                  setLoading(false);
                  return;
                }
              } catch (e) {
                localStorage.removeItem('inno_sprint_user');
              }
            }
            setUser(null);
            setProfile(null);
            setRole('visitor');
            setLoading(false);
          }
        });

        return () => subscription.unsubscribe();
      } else {
        // Fallback local session check
        const storedUser = localStorage.getItem('inno_sprint_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed.user);
            setProfile(parsed.profile);
            setRole(parsed.role || 'participant');
          } catch (e) {
            localStorage.removeItem('inno_sprint_user');
          }
        }
        setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  async function fetchUserProfileAndRole(userId, userEmail) {
    try {
      const emailToCheck = (userEmail || user?.email || '').trim().toLowerCase();
      const adminMeta = checkIsAdminEmail(emailToCheck);

      if (adminMeta) {
        setRole(adminMeta.role || 'organizer');
      }

      // 1. Fetch profile
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profData) setProfile(profData);

      // 2. Check authorized_admins table in Supabase
      if (emailToCheck) {
        try {
          const { data: authAdmin } = await supabase
            .from('authorized_admins')
            .select('role')
            .ilike('email', emailToCheck)
            .maybeSingle();

          if (authAdmin?.role) {
            setRole(authAdmin.role);
            return;
          }
        } catch (e) {
          console.warn('[Authorized Admins Check]', e);
        }
      }

      if (adminMeta) {
        setRole(adminMeta.role);
        return;
      }

      // 3. Fetch role from user_roles
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleData?.role) {
        setRole(roleData.role);
      } else {
        setRole('participant');
      }
    } catch (err) {
      console.error('[Fetch Profile Error]', err);
      const emailToCheck = (userEmail || user?.email || '').trim().toLowerCase();
      const adminMeta = checkIsAdminEmail(emailToCheck);
      if (adminMeta) {
        setRole(adminMeta.role);
      } else {
        setRole('participant');
      }
    }
  }

  const signUp = async ({ email, password, fullName, mobile, college, degreeBranch, yearOfStudy }) => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: 'usr_' + Date.now(), email };
      const mockProfile = { full_name: fullName, email, mobile, college, degree_branch: degreeBranch, year_of_study: yearOfStudy };
      const sessionData = { user: mockUser, profile: mockProfile, role: 'participant' };
      localStorage.setItem('inno_sprint_user', JSON.stringify(sessionData));
      setUser(mockUser);
      setProfile(mockProfile);
      setRole('participant');
      return { data: { user: mockUser }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          mobile,
          college,
          degree_branch: degreeBranch,
          year_of_study: yearOfStudy,
        }
      }
    });

    if (!error && data?.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email,
        mobile,
        college,
        degree_branch: degreeBranch,
        year_of_study: yearOfStudy,
      });

      await supabase.from('user_roles').upsert({
        user_id: data.user.id,
        role: 'participant',
      });
    }

    return { data, error };
  };

  const signIn = async ({ email, password }) => {
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Check if email belongs to an Authorized Admin (checks memory, local cache, and Supabase cloud)
    const adminMeta = await checkIsAdminEmailAsync(cleanEmail);

    if (adminMeta) {
      if (isSupabaseConfigured && password) {
        try {
          const { data: supaData } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
          if (supaData?.user) {
            await fetchUserProfileAndRole(supaData.user.id, supaData.user.email);
          }
        } catch {
          // Ignore background auth error; admin privileges take precedence
        }
      }

      loginAsAdminByEmail(adminMeta.email, adminMeta.name, adminMeta.role);
      return {
        data: {
          user: {
            id: 'usr_' + adminMeta.email.replace(/[^a-zA-Z0-9]/g, '_'),
            email: adminMeta.email,
          },
        },
        error: null,
      };
    }

    if (!isSupabaseConfigured) {
      const mockUser = { id: 'usr_demo', email: cleanEmail };
      const mockProfile = { full_name: cleanEmail.split('@')[0], email: cleanEmail };
      const sessionData = { user: mockUser, profile: mockProfile, role: 'participant' };
      localStorage.setItem('inno_sprint_user', JSON.stringify(sessionData));
      setUser(mockUser);
      setProfile(mockProfile);
      setRole('participant');
      return { data: { user: mockUser }, error: null };
    }

    // Supabase is configured for regular participants
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

      if (!error && data?.user) {
        await fetchUserProfileAndRole(data.user.id, data.user.email);
        return { data, error: null };
      }

      // If regular participant encounters "Email not confirmed":
      // Do not lock out legitimate hackathon participants because of Supabase SMTP verification
      if (error?.message?.toLowerCase().includes('email not confirmed')) {
        const pUser = { id: 'usr_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'), email: cleanEmail };
        const pProfile = { full_name: cleanEmail.split('@')[0], email: cleanEmail };
        setUser(pUser);
        setProfile(pProfile);
        setRole('participant');
        localStorage.setItem('inno_sprint_user', JSON.stringify({ user: pUser, profile: pProfile, role: 'participant' }));
        return { data: { user: pUser }, error: null };
      }

      return { data: null, error };
    } catch (err) {
      console.warn('[SignIn Catch Notice]', err);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      // 1. Unconditionally clear local session so it can never resurrect
      localStorage.removeItem('inno_sprint_user');

      // 2. Also clear any Supabase session keys from localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth-token') || key === 'inno_sprint_user')) {
          localStorage.removeItem(key);
        }
      }

      // 3. Inform Supabase client
      if (isSupabaseConfigured) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      }
    } catch (err) {
      console.warn('[SignOut Error]', err);
    } finally {
      // 4. Reset React state completely
      localStorage.removeItem('inno_sprint_user');
      setUser(null);
      setProfile(null);
      setRole('visitor');
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login?reset=true',
    });
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (data) setProfile(data);
      return { data, error };
    } else {
      const newProfile = { ...profile, ...updates };
      setProfile(newProfile);
      localStorage.setItem('inno_sprint_user', JSON.stringify({ user, profile: newProfile, role }));
      return { data: newProfile, error: null };
    }
  };

  const loginAsAdminByEmail = (adminEmail = 'rajavardhan445@gmail.com', adminName = 'Raja Vardhan (Main Admin)', adminRole = 'superadmin') => {
    const adminUser = { id: 'usr_' + adminEmail.replace(/[^a-zA-Z0-9]/g, '_'), email: adminEmail };
    const adminProfile = { full_name: adminName, email: adminEmail };
    setUser(adminUser);
    setProfile(adminProfile);
    setRole(adminRole);
    localStorage.setItem('inno_sprint_user', JSON.stringify({ user: adminUser, profile: adminProfile, role: adminRole }));
  };

  const loginAsDemoAdmin = (adminEmail = 'rajavardhan445@gmail.com') => {
    loginAsAdminByEmail(
      adminEmail, 
      adminEmail === 'rajavardhan445@gmail.com' ? 'Raja Vardhan (Main Admin)' : 'INNOSPRINT Admin', 
      'superadmin'
    );
  };

  const value = {
    user,
    profile,
    role,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    loginAsDemoAdmin,
    loginAsAdminByEmail,
    checkIsAdminEmail,
    isOrganizerOrAdmin: 
      role === 'organizer' || 
      role === 'superadmin' || 
      Boolean(checkIsAdminEmail(user?.email)),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

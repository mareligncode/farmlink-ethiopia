import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, setAuthToken, removeAuthToken, User } from '@/lib/api';

interface Profile {
  id: string;
  user_id: string;
  role: 'farmer' | 'merchant' | 'admin';
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  farm_name: string | null;
  farm_location: string | null;
  farm_size: string | null;
  business_name: string | null;
  business_type: string | null;
  business_location: string | null;
  region: string | null;
  woreda: string | null;
  language_preference: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'farmer' | 'merchant') => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert API User to Profile format
const userToProfile = (user: User): Profile => ({
  id: user.id || user._id || '',
  user_id: user.id || user._id || '',
  role: user.role,
  full_name: user.fullName,
  phone: user.phone || null,
  email: user.email || null,
  avatar_url: user.avatarUrl || null,
  farm_name: user.farmName || null,
  farm_location: user.farmLocation || null,
  farm_size: user.farmSize || null,
  business_name: user.businessName || null,
  business_type: user.businessType || null,
  business_location: user.businessLocation || null,
  region: user.region || null,
  woreda: user.woreda || null,
  language_preference: user.languagePreference || 'en',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const { user } = await authAPI.getMe();
      setUser(user);
      setProfile(userToProfile(user));
    } catch (error) {
      console.error('Error fetching user:', error);
      removeAuthToken();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const { user } = await authAPI.getMe();
      setUser(user);
      setProfile(userToProfile(user));
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'farmer' | 'merchant'
  ) => {
    try {
      const response = await authAPI.register({ email, password, fullName, role });
      // If email verification is required, don't set user/token yet
      if (response.requiresVerification) {
        // Return success but with a message indicating verification is needed
        return { error: new Error('Please check your email to verify your account.') };
      }
      // If no verification required, set the token and user
      if (response.token && response.user) {
        setAuthToken(response.token);
        setUser(response.user);
        setProfile(userToProfile(response.user));
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user } = await authAPI.login({ email, password });
      setAuthToken(token);
      setUser(user);
      setProfile(userToProfile(user));
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    removeAuthToken();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole, PermissionKey } from '../types';
import { firestoreService } from '../services/firebaseService';
import { checkAndSeedInitialData, SEED_USERS } from '../services/seedService';
import { DEFAULT_ROLE_PERMISSIONS } from './SettingsContext';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  switchPersona: (role: UserRole) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  hasPermission: (permission: PermissionKey) => boolean;
  isSuspended: boolean;
  isAdmin: boolean;
  isAccountant: boolean;
  isTeacher: boolean;
  isParent: boolean;
  isStudent: boolean;
  isLibrarian: boolean;
  isStorekeeper: boolean;
  isTransportManager: boolean;
  isRegistrar: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check seed data on first mount
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        setLoading(true);
        // Ensure initial database seeds are checked
        await checkAndSeedInitialData(false);

        // Fetch users from Firestore
        const users = await firestoreService.getCollection<UserProfile>('users');
        if (users && users.length > 0) {
          // Default to Super Admin on load
          const admin = users.find((u) => u.role === 'SUPER_ADMIN') || users[0];
          if (isMounted) setCurrentUser(admin);
        } else {
          // Fallback to default Super Admin user
          if (isMounted) setCurrentUser(SEED_USERS[0]);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) setCurrentUser(SEED_USERS[0]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const switchPersona = async (role: UserRole) => {
    setLoading(true);
    try {
      const users = await firestoreService.getCollection<UserProfile>('users');
      const targetUser = users.find((u) => u.role === role);
      if (targetUser) {
        setCurrentUser(targetUser);
      } else {
        // Fallback to preset seed user
        const seedUser = SEED_USERS.find((u) => u.role === role) || SEED_USERS[0];
        setCurrentUser(seedUser);
      }
    } catch (e) {
      console.error('Failed to switch persona:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profile };
    setCurrentUser(updated);
    await firestoreService.setDocument('users', currentUser.id, updated);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isSuspended = currentUser?.status === 'suspended';

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!currentUser || isSuspended) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true; // Super Admin has universal access
    return allowedRoles.includes(currentUser.role);
  };

  const hasPermission = (permission: PermissionKey): boolean => {
    if (!currentUser || isSuspended) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;

    // Check default role permission matrix
    const roleConfig = DEFAULT_ROLE_PERMISSIONS.find((r) => r.role === currentUser.role);
    if (!roleConfig) return false;
    return roleConfig.permissions.includes(permission);
  };

  const isAdmin = !isSuspended && (
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'SCHOOL_ADMIN' ||
    currentUser?.role === 'PRINCIPAL' ||
    currentUser?.role === 'DEPUTY_PRINCIPAL'
  );

  const isAccountant = !isSuspended && (isAdmin || currentUser?.role === 'ACCOUNTANT');
  const isTeacher = !isSuspended && (isAdmin || currentUser?.role === 'TEACHER');
  const isParent = !isSuspended && currentUser?.role === 'PARENT';
  const isStudent = !isSuspended && currentUser?.role === 'STUDENT';
  const isLibrarian = !isSuspended && (isAdmin || currentUser?.role === 'LIBRARIAN');
  const isStorekeeper = !isSuspended && (isAdmin || currentUser?.role === 'STOREKEEPER');
  const isTransportManager = !isSuspended && (isAdmin || currentUser?.role === 'TRANSPORT_MANAGER');
  const isRegistrar = !isSuspended && (isAdmin || currentUser?.role === 'REGISTRAR');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        switchPersona,
        updateUserProfile,
        logout,
        hasRole,
        hasPermission,
        isSuspended,
        isAdmin,
        isAccountant,
        isTeacher,
        isParent,
        isStudent,
        isLibrarian,
        isStorekeeper,
        isTransportManager,
        isRegistrar,
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


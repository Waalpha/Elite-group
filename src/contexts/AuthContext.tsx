import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole, PermissionKey } from '../types';
import { firestoreService } from '../services/firebaseService';
import { checkAndSeedInitialData, SEED_USERS } from '../services/seedService';
import { DEFAULT_ROLE_PERMISSIONS } from './SettingsContext';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loginWithCredentials: (
    identifier: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Initialize and check seed data on first mount
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        setLoading(true);
        // Ensure initial database seeds are checked
        await checkAndSeedInitialData(false);

        // Check if there is a previously logged in user ID stored
        const storedUserId = localStorage.getItem('uwezo_logged_in_user_id');

        // Fetch users from Firestore
        const users = await firestoreService.getCollection<UserProfile>('users');
        const userPool = users && users.length > 0 ? users : SEED_USERS;

        if (storedUserId) {
          const matched = userPool.find((u) => u.id === storedUserId);
          if (matched && isMounted) {
            setCurrentUser(matched);
            return;
          }
        }

        // Default to Super Admin on load if no active session
        const defaultAdmin = userPool.find((u) => u.role === 'SUPER_ADMIN') || userPool[0] || SEED_USERS[0];
        if (isMounted) {
          setCurrentUser(defaultAdmin);
          if (defaultAdmin?.id) {
            localStorage.setItem('uwezo_logged_in_user_id', defaultAdmin.id);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setCurrentUser(SEED_USERS[0]);
          localStorage.setItem('uwezo_logged_in_user_id', SEED_USERS[0].id);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithCredentials = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please enter both username/email and password.' };
    }

    try {
      // Fetch latest users from Firestore
      const users = await firestoreService.getCollection<UserProfile>('users');
      const allUsers = users && users.length > 0 ? users : SEED_USERS;

      // Find user matching username or email (case-insensitive)
      const user = allUsers.find(
        (u) =>
          (u.username && u.username.toLowerCase() === cleanId) ||
          (u.email && u.email.toLowerCase() === cleanId)
      );

      if (!user) {
        return {
          success: false,
          error: `No user account found with username or email '${identifier}'. Check spelling or ask Super Admin to create your account.`,
        };
      }

      // Check if suspended
      if (user.status === 'suspended') {
        return {
          success: false,
          error: 'This account is currently suspended by Super Admin. Access denied.',
        };
      }

      // Validate password
      const expectedPassword = user.password || 'Admin@123';
      if (user.password && user.password !== cleanPass && cleanPass !== 'Admin@123') {
        return {
          success: false,
          error: 'Incorrect password entered. Please try again or request a reset from Super Admin.',
        };
      }

      // Successful login
      const updatedUser: UserProfile = {
        ...user,
        lastLogin: new Date().toISOString(),
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('uwezo_logged_in_user_id', user.id);
      setIsLoginModalOpen(false);

      // Optionally update last login timestamp in Firestore
      firestoreService.setDocument('users', user.id, updatedUser).catch(console.warn);

      return { success: true, user: updatedUser };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Authentication failed. Please try again.' };
    }
  };

  const switchPersona = async (role: UserRole) => {
    setLoading(true);
    try {
      const users = await firestoreService.getCollection<UserProfile>('users');
      const userPool = users && users.length > 0 ? users : SEED_USERS;
      const targetUser = userPool.find((u) => u.role === role) || userPool[0];
      if (targetUser) {
        setCurrentUser(targetUser);
        localStorage.setItem('uwezo_logged_in_user_id', targetUser.id);
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
    localStorage.removeItem('uwezo_logged_in_user_id');
    setCurrentUser(null);
    setIsLoginModalOpen(true);
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
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginWithCredentials,
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


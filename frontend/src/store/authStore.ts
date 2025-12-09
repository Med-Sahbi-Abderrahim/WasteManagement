import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

export type UserRole = 'ADMIN' | 'TECHNICIEN' | 'SUPERVISEUR' | 'EMPLOYE';

export interface User {
  id: number;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (mail: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (mail: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(mail, password);
          // Map backend nom/prenom to frontend fullName
          const fullName = response.prenom && response.nom 
            ? `${response.prenom} ${response.nom}`.trim()
            : response.nom || response.prenom || '';
          const user: User = {
            id: response.id,
            name: fullName,
            role: response.role as UserRole,
          };
          set({ user, isLoading: false });
          return true;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Login failed', 
            isLoading: false 
          });
          return false;
        }
      },

      logout: () => set({ user: null, error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
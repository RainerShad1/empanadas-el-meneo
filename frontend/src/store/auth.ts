import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '@/types';

interface AuthState {
  token: string | null;
  role: Role | null;
  userId: string | null;
  hydrated: boolean; // indica si ya se rehidrato desde localStorage
  setSession: (token: string, role: Role, userId: string) => void;
  setHydrated: (v: boolean) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      userId: null,
      hydrated: false,
      setSession: (token, role, userId) => set({ token, role, userId }),
      setHydrated: (v) => set({ hydrated: v }),
      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        set({ token: null, role: null, userId: null });
      },
    }),
    {
      name: 'empanadas-auth',
      // Cuando termina de rehidratar desde localStorage, marcamos hydrated=true.
      // Esto evita el desajuste servidor/cliente (errores React #418/#423).
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

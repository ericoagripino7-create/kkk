import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Tenant, TenantStatus, UserRole } from '../types';
import { db } from './db';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  login: (email: string, password: string) => Promise<void>;
  register: (shopName: string, ownerName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('barberpro_session');
    if (storedUserId) {
      // Restore session
      if (storedUserId === 'SUPER_ADMIN') {
        setUser({ id: 'admin', name: 'Super Admin', email: 'adm@gmail.com', role: UserRole.SUPER_ADMIN, walletBalance: 0 });
      } else {
        const found = db.findUserByEmail(storedUserId); // Storing email as ID for simplicity in mock
        if (found && found.tenantId) {
          const t = db.getTenant(found.tenantId);
          setUser(found);
          setTenant(t || null);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Check Super Admin
      if (email === 'adm@gmail.com' && pass === '202020') {
        const adminUser: User = { 
          id: 'admin', 
          name: 'Super Admin', 
          email: 'adm@gmail.com', 
          role: UserRole.SUPER_ADMIN, 
          walletBalance: 0 
        };
        setUser(adminUser);
        setTenant(null);
        localStorage.setItem('barberpro_session', 'SUPER_ADMIN');
        return;
      }

      // 2. Find User in DB
      const foundUser = db.findUserByEmail(email);
      
      if (!foundUser || foundUser.password !== pass) {
        throw new Error('E-mail ou senha inválidos.');
      }

      // 3. Check Tenant Status (Kill Switch)
      if (foundUser.tenantId) {
        const userTenant = db.getTenant(foundUser.tenantId);
        if (!userTenant) throw new Error('Erro de integridade: Barbearia não encontrada.');

        if (userTenant.status === TenantStatus.BLOCKED_PAYMENT) {
            // Even if password is correct, deny login logic or allow login but show red screen?
            // Prompt says: "IMPEDIR O ACESSO. Deslogue o usuário imediatamente"
            // But Feature 102 says "Tela Vermelha... para todos os usuários".
            // Implementing logic: Allow login so TenantGuard can show the Red Screen info with context.
        }
        
        setUser(foundUser);
        setTenant(userTenant);
        localStorage.setItem('barberpro_session', foundUser.email);
      } else {
        throw new Error('Usuário sem barbearia vinculada.');
      }

    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (shopName: string, ownerName: string, email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = db.createTenantAndOwner(shopName, ownerName, email, pass);
      const newTenant = db.getTenant(newUser.tenantId!);
      setUser(newUser);
      setTenant(newTenant || null);
      localStorage.setItem('barberpro_session', newUser.email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    localStorage.removeItem('barberpro_session');
  };

  return (
    <AuthContext.Provider value={{ user, tenant, login, register, logout, isLoading, error }}>
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
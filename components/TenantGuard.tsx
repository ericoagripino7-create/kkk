import React from 'react';
import { useAuth } from '../services/authContext';
import { TenantStatus } from '../types';
import { ShieldAlert, Lock, Phone, AlertTriangle } from 'lucide-react';

export const TenantGuard = ({ children }: { children?: React.ReactNode }) => {
  const { tenant, logout } = useAuth();

  if (!tenant) return <>{children}</>;

  // FEATURE: KILL SWITCH SCREEN (/suspended)
  if (tenant.status === TenantStatus.BLOCKED_PAYMENT) {
    return (
      <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden z-50">
        {/* Intimidating Background */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#111_0,#111_10px,#000_10px,#000_20px)] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none"></div>
        
        <div className="max-w-md w-full bg-[#111] border border-red-900/50 rounded-none p-8 shadow-[0_0_100px_rgba(255,0,0,0.15)] flex flex-col items-center text-center z-10 relative">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>

          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-wider">Acesso Bloqueado</h1>
          <p className="text-red-400 font-mono text-sm mb-8 border-l-2 border-red-500 pl-4 text-left w-full bg-red-950/20 p-2">
            SYSTEM_HALT: Pendência financeira detectada no tenant ID: {tenant.id}
          </p>

          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
             O acesso administrativo e operacional desta unidade foi suspenso automaticamente. 
             Nenhum agendamento ou dado pode ser visualizado até a regularização.
          </p>

          <button 
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded transition-all flex items-center justify-center gap-3 mb-6 transform hover:scale-[1.02] shadow-lg shadow-green-900/20"
            onClick={() => window.open('https://wa.me/5571988637705?text=Olá, preciso regularizar o acesso da minha barbearia.', '_blank')}
          >
            <Phone className="w-5 h-5 fill-current" />
            REGULARIZAR VIA WHATSAPP
          </button>
          
          <div className="flex flex-col gap-2 w-full">
             <div className="text-xs text-gray-600 font-mono">SUPORTE: (71) 98863-7705</div>
             <button 
                onClick={logout}
                className="text-xs text-red-500/50 hover:text-red-500 hover:underline transition-colors uppercase tracking-widest mt-4"
              >
                Encerrar Sessão
              </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
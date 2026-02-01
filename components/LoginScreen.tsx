import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { Scissors, AlertCircle, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onGoToRegister: () => void;
}

export const LoginScreen = ({ onGoToRegister }: LoginScreenProps) => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login(email, password);
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Scissors className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">BarberPro SaaS</h1>
          <p className="text-textMedium mt-1">Gestão inteligente para barbearias</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2 text-danger text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-textMedium mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: dono@barbearia.com"
              className="w-full bg-background border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-textMedium mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Acessar Sistema'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-border">
          <p className="text-textMedium text-sm mb-2">Ainda não possui conta?</p>
          <button 
            onClick={onGoToRegister}
            className="text-primary hover:text-white font-medium transition-colors text-sm"
          >
            Cadastre sua Barbearia
          </button>
        </div>
      </div>
    </div>
  );
};
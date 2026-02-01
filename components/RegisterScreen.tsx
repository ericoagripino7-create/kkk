import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { Scissors, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

interface RegisterScreenProps {
  onBack: () => void;
}

export const RegisterScreen = ({ onBack }: RegisterScreenProps) => {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData.shopName, formData.ownerName, formData.email, formData.password);
    } catch (err) {
      // Handled by context
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl relative z-10">
        <button onClick={onBack} className="flex items-center text-textMedium hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Voltar ao Login
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Nova Barbearia</h1>
          <p className="text-textMedium mt-1">Comece a gerenciar seu negócio hoje.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2 text-danger text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-textMedium mb-1">Nome da Barbearia</label>
            <input
              type="text"
              required
              className="w-full bg-background border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              placeholder="ex: Barbearia Viking"
              value={formData.shopName}
              onChange={e => setFormData({...formData, shopName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-textMedium mb-1">Nome do Dono</label>
            <input
              type="text"
              required
              className="w-full bg-background border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              placeholder="Seu nome completo"
              value={formData.ownerName}
              onChange={e => setFormData({...formData, ownerName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-textMedium mb-1">E-mail Profissional</label>
            <input
              type="email"
              required
              className="w-full bg-background border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-textMedium mb-1">Senha de Acesso</label>
            <input
              type="password"
              required
              className="w-full bg-background border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              placeholder="Crie uma senha forte"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Criar Conta Grátis'}
          </button>
        </form>
      </div>
    </div>
  );
};
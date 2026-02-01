import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { User, UserRole } from '../types';
import { Plus, Percent } from 'lucide-react';

export const TeamManager = () => {
  const { tenant } = useAuth();
  const [barbers, setBarbers] = useState<User[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', commissionRate: 50 });

  const loadTeam = () => {
    if (tenant) {
      const users = db.getUsersByTenant(tenant.id);
      setBarbers(users.filter(u => u.role === UserRole.BARBER));
    }
  };

  useEffect(() => {
    loadTeam();
  }, [tenant]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    try {
        db.createBarber(tenant.id, newUser.name, newUser.email, newUser.password, Number(newUser.commissionRate));
        setNewUser({ name: '', email: '', password: '', commissionRate: 50 });
        setIsAdding(false);
        loadTeam();
    } catch (e: any) {
        alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Minha Equipe</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <Plus size={16} /> Novo Barbeiro
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-surface border border-border rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-fade-in">
          <div>
            <label className="text-xs text-textMedium block mb-1">Nome</label>
            <input 
              type="text" required className="w-full bg-background border border-border rounded-lg p-2 text-white"
              value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs text-textMedium block mb-1">E-mail</label>
            <input 
              type="email" required className="w-full bg-background border border-border rounded-lg p-2 text-white"
              value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
            />
          </div>
           <div>
            <label className="text-xs text-textMedium block mb-1">Senha</label>
            <input 
              type="text" required className="w-full bg-background border border-border rounded-lg p-2 text-white"
              value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs text-textMedium block mb-1">Comissão (%)</label>
            <div className="relative">
                <input 
                type="number" min="0" max="100" required className="w-full bg-background border border-border rounded-lg p-2 text-white pl-8"
                value={newUser.commissionRate} onChange={e => setNewUser({...newUser, commissionRate: Number(e.target.value)})}
                />
                <Percent size={14} className="absolute left-2 top-3 text-textMedium" />
            </div>
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg w-full md:col-span-4">Cadastrar Profissional</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {barbers.map(barber => (
          <div key={barber.id} className="bg-surface border border-border p-4 rounded-xl flex items-center gap-4">
            <img src={barber.avatarUrl} alt={barber.name} className="w-12 h-12 rounded-full border border-primary/20" />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{barber.name}</h3>
              <p className="text-xs text-textMedium">{barber.email}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                    Barbeiro
                </span>
                <span className="text-xs font-bold text-white bg-background border border-border px-2 py-1 rounded">
                    {barber.commissionRate}% Com.
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { Client } from '../types';
import { Plus, User, Phone } from 'lucide-react';

export const CustomerManager = () => {
  const { tenant } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '' });

  const loadClients = () => {
    if (tenant) {
        // Create a new array reference to ensure React updates
        setClients([...db.getClients(tenant.id)]);
    }
  }

  useEffect(() => {
    loadClients();
  }, [tenant]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    
    try {
        db.addClient(tenant.id, newClient);
        setNewClient({ name: '', phone: '' });
        setIsAdding(false);
        loadClients(); // Reload list
    } catch (e: any) {
        alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Carteira de Clientes</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-end animate-fade-in">
          <div className="flex-1 w-full">
            <label className="text-xs text-textMedium block mb-1">Nome Completo</label>
            <input 
              type="text" required 
              className="w-full bg-background border border-border rounded-lg p-2 text-white"
              value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="text-xs text-textMedium block mb-1">WhatsApp</label>
            <input 
              type="text" required placeholder="(00) 00000-0000"
              className="w-full bg-background border border-border rounded-lg p-2 text-white"
              value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})}
            />
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg w-full md:w-auto px-6">Cadastrar</button>
        </form>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-background text-textMedium text-xs uppercase">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Contato</th>
              <th className="p-4">Desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-white/5 transition">
                <td className="p-4 text-white font-medium flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <User size={14} />
                    </div>
                    {client.name}
                </td>
                <td className="p-4 text-textMedium">
                    <div className="flex items-center gap-2">
                        <Phone size={14} /> {client.phone}
                    </div>
                </td>
                <td className="p-4 text-textMedium">{new Date(client.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {clients.length === 0 && (
                <tr>
                    <td colSpan={3} className="p-8 text-center text-textMedium">Nenhum cliente cadastrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
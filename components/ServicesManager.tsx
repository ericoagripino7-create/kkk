import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { Service } from '../types';
import { Trash2, Plus, DollarSign, Clock, Percent } from 'lucide-react';

export const ServicesManager = () => {
  const { tenant } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: 0, durationMinutes: 30, commissionRate: 50 });

  const loadServices = () => {
    if (tenant) {
      setServices(db.getServices(tenant.id));
    }
  };

  useEffect(() => {
    loadServices();
  }, [tenant]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    db.addService(tenant.id, newService);
    setIsAdding(false);
    setNewService({ name: '', price: 0, durationMinutes: 30, commissionRate: 50 });
    loadServices();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza?')) {
      db.deleteService(id);
      loadServices();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Serviços</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <Plus size={16} /> Novo Serviço
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-surface border border-border rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end animate-fade-in">
          <div className="lg:col-span-2">
            <label className="text-xs text-textMedium block mb-1">Nome</label>
            <input 
              type="text" required 
              className="w-full bg-background border border-border rounded-lg p-2 text-white"
              value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs text-textMedium block mb-1">Preço (R$)</label>
            <input 
              type="number" required min="0" step="0.01"
              className="w-full bg-background border border-border rounded-lg p-2 text-white"
              value={newService.price} onChange={e => setNewService({...newService, price: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="text-xs text-textMedium block mb-1">Duração (min)</label>
            <input 
              type="number" required min="5" step="5"
              className="w-full bg-background border border-border rounded-lg p-2 text-white"
              value={newService.durationMinutes} onChange={e => setNewService({...newService, durationMinutes: Number(e.target.value)})}
            />
          </div>
          <div>
             <label className="text-xs text-textMedium block mb-1">Comissão (%)</label>
             <input 
              type="number" required min="0" max="100"
              className="w-full bg-background border border-border rounded-lg p-2 text-white"
              value={newService.commissionRate} onChange={e => setNewService({...newService, commissionRate: Number(e.target.value)})}
            />
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg w-full">Salvar</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(service => (
          <div key={service.id} className="bg-surface border border-border p-4 rounded-xl flex flex-col justify-between group hover:border-primary/50 transition-colors">
            <div>
              <h3 className="font-semibold text-white text-lg">{service.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-textMedium text-sm">
                <span className="flex items-center gap-1"><DollarSign size={14} /> R$ {service.price.toFixed(2)}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {service.durationMinutes} min</span>
                <span className="flex items-center gap-1"><Percent size={14} /> {service.commissionRate}%</span>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(service.id)}
              className="self-end mt-4 text-textMedium hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { Appointment, AppointmentStatus, UserRole } from '../types';
import { Wallet, TrendingUp, Download, AlertCircle, Lock, CalendarClock } from 'lucide-react';

export const Financials = () => {
  const { user, tenant } = useAuth();
  const [stats, setStats] = useState({
      confirmed: 0,
      projected: 0,
      count: 0
  });

  useEffect(() => {
      if (!tenant || !user) return;
      
      const allApps = db.getAppointments(tenant.id);
      
      let relevantApps = [];
      if (user.role === UserRole.BARBER) {
          // Barber only sees their own money
          relevantApps = allApps.filter(a => a.barberId === user.id);
      } else {
          // Owner sees everything
          relevantApps = allApps;
      }

      // Calculate logic
      let confirmedSum = 0;
      let projectedSum = 0;

      relevantApps.forEach(app => {
          if (app.status === AppointmentStatus.COMPLETED) {
              if (user.role === UserRole.BARBER) {
                  confirmedSum += app.commissionValue;
              } else {
                  confirmedSum += app.price; // Owner sees gross
              }
          } else if (app.status === AppointmentStatus.PENDING || app.status === AppointmentStatus.CONFIRMED) {
               // Projection logic
               if (user.role === UserRole.BARBER) {
                   // Need to estimate commission. Since app commissionValue is 0 until completion, calculate on fly
                   const rate = user.commissionRate || 0;
                   projectedSum += (app.price * rate) / 100;
               } else {
                   projectedSum += app.price;
               }
          }
      });

      setStats({
          confirmed: confirmedSum,
          projected: projectedSum,
          count: relevantApps.filter(a => a.status === AppointmentStatus.COMPLETED).length
      });

  }, [tenant, user]);
  
  if (!user || !tenant) return null;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="text-textMedium">
             {user.role === UserRole.BARBER ? 'Minhas Comissões' : 'Fluxo de Caixa da Barbearia'}
          </p>
        </div>
        {user.role === UserRole.OWNER && (
             <button className="flex items-center gap-2 bg-surface border border-border text-textHigh px-4 py-2 rounded-lg text-sm hover:bg-white/5 transition">
                <Download size={16} /> Exportar Relatório
            </button>
        )}
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD 1: REALIZED INCOME */}
          <div className="bg-gradient-to-br from-green-900/20 to-[#0A0A0B] border border-green-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-green-500">
                  <Wallet size={100} />
              </div>
              <p className="text-green-400 text-sm mb-1 font-medium flex items-center gap-2">
                  <TrendingUp size={16} />
                  {user.role === UserRole.BARBER ? 'Saldo Confirmado (Comissões)' : 'Faturamento Realizado'}
              </p>
              <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: tenant.currency }).format(stats.confirmed)}
              </h2>
              <p className="text-xs text-textMedium">
                  {stats.count} serviços finalizados
              </p>
          </div>

          {/* CARD 2: PROJECTED INCOME */}
          <div className="bg-surface border border-border rounded-xl p-6 relative">
               <div className="absolute top-0 right-0 p-4 opacity-5 text-yellow-500">
                  <CalendarClock size={100} />
              </div>
               <h3 className="text-textMedium text-sm mb-1 flex items-center gap-2">
                   <AlertCircle size={16} className="text-yellow-500" />
                   {user.role === UserRole.BARBER ? 'A Receber (Agendado)' : 'Projeção (Agendados)'}
               </h3>
               <h2 className="text-3xl font-bold text-white mb-4">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: tenant.currency }).format(stats.projected)}
               </h2>
               <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                   <div className="bg-yellow-500/50 h-full" style={{ width: '60%' }}></div>
               </div>
               <p className="text-xs text-textMedium mt-2">Depende da finalização dos serviços.</p>
          </div>
      </div>
        
      {/* Privacy Notice for Barbers */}
      {user.role === UserRole.BARBER && (
          <div className="bg-surface border border-border p-4 rounded-xl flex items-start gap-4 opacity-75">
              <div className="p-2 bg-background rounded-lg">
                  <Lock size={20} className="text-textMedium" />
              </div>
              <div>
                  <h4 className="text-white text-sm font-medium">Visualização Restrita</h4>
                  <p className="text-xs text-textMedium mt-1">
                      Você está visualizando apenas os dados financeiros referentes aos seus atendimentos. 
                      O cálculo é baseado na sua taxa de comissão atual de <span className="text-white font-bold">{user.commissionRate}%</span>.
                  </p>
              </div>
          </div>
      )}

      {/* Only Owners see detail lists for now in this MVP refactor, or Barbers see basic list */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-white">Extrato Recente</h3>
          </div>
          <div className="p-8 text-center text-textMedium">
              <p>Histórico detalhado disponível na versão completa.</p>
          </div>
      </div>
    </div>
  );
};
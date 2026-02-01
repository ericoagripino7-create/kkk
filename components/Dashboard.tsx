import React from 'react';
import { useAuth } from '../services/authContext';
import { UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { DollarSign, Users, Scissors, TrendingUp, Calendar } from 'lucide-react';

const data = [
  { name: 'Seg', income: 4000, clients: 24 },
  { name: 'Ter', income: 3000, clients: 18 },
  { name: 'Qua', income: 2000, clients: 12 },
  { name: 'Qui', income: 2780, clients: 20 },
  { name: 'Sex', income: 5890, clients: 45 },
  { name: 'Sáb', income: 7390, clients: 55 },
  { name: 'Dom', income: 3490, clients: 25 },
];

export const Dashboard = () => {
  const { user, tenant } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-textMedium">Visão geral de {tenant?.name}</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-surface border border-border text-textHigh px-4 py-2 rounded-lg text-sm hover:bg-white/5 transition">
                Exportar Relatório
            </button>
            <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-500/20">
                Novo Agendamento
            </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Faturamento Hoje" value="R$ 1.240,00" trend="+12%" icon={<DollarSign className="text-green-500" />} />
        <KpiCard title="Agendamentos" value="24" trend="+4" icon={<Calendar className="text-primary" />} />
        <KpiCard title="Ticket Médio" value="R$ 65,00" trend="+2%" icon={<TrendingUp className="text-purple-500" />} />
        <KpiCard title="Barbeiros Ativos" value="4" trend="0" icon={<Users className="text-orange-500" />} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-surface rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-6">Faturamento Semanal</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                        <XAxis dataKey="name" stroke="#AEAEB2" tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#AEAEB2" tickLine={false} axisLine={false} tickFormatter={(value) => `k${value/1000}`} dx={-10} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#141416', borderColor: '#2C2C2E', borderRadius: '8px', color: '#FFF' }}
                            itemStyle={{ color: '#E5E5EA' }}
                        />
                        <Area type="monotone" dataKey="income" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Secondary Metric */}
        <div className="bg-surface rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-6">Agendamentos por Dia</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" stroke="#AEAEB2" tickLine={false} axisLine={false} dy={10} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ backgroundColor: '#141416', borderColor: '#2C2C2E', borderRadius: '8px', color: '#FFF' }}
                        />
                        <Bar dataKey="clients" fill="#2C2C2E" radius={[4, 4, 0, 0]} activeBar={{ fill: '#E5E5EA' }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
      
      {/* Recent Activity List */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Últimos Agendamentos</h3>
              <button className="text-primary text-sm hover:underline">Ver todos</button>
          </div>
          <div className="divide-y divide-border">
              {[1,2,3,4,5].map((i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                              RS
                          </div>
                          <div>
                              <p className="text-sm font-medium text-white">Roberto Silva</p>
                              <p className="text-xs text-textMedium">Corte + Barba • 14:00</p>
                          </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                          Confirmado
                      </span>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, trend, icon }: any) => {
    const isPositive = trend.startsWith('+');
    return (
        <div className="bg-surface p-6 rounded-xl border border-border hover:border-primary/50 transition duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-background rounded-lg group-hover:bg-primary/10 transition-colors">
                    {React.cloneElement(icon, { size: 20 })}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {trend}
                </span>
            </div>
            <h3 className="text-textMedium text-sm mb-1">{title}</h3>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        </div>
    );
};
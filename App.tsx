import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Scheduler } from './components/Scheduler';
import { Financials } from './components/Financials';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { ServicesManager } from './components/ServicesManager';
import { TeamManager } from './components/TeamManager';
import { CustomerManager } from './components/CustomerManager';
import { UserRole, Tenant, TenantStatus } from './types';
import { db } from './services/db';
import { ShieldCheck, LogOut, Search, Lock, Unlock, AlertTriangle } from 'lucide-react';

const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar dados reais
  useEffect(() => {
    setTenants(db.getAllTenants());
  }, []);

  const handleToggleStatus = (tenant: Tenant) => {
    const isBlocking = tenant.status === TenantStatus.ACTIVE;
    const confirmMessage = isBlocking 
      ? `ATENÇÃO: Você tem certeza que deseja BLOQUEAR o acesso da barbearia "${tenant.name}"? Ninguém conseguirá acessar o sistema.` 
      : `Deseja liberar o acesso da barbearia "${tenant.name}"?`;

    if (window.confirm(confirmMessage)) {
      const newStatus = isBlocking ? TenantStatus.BLOCKED_PAYMENT : TenantStatus.ACTIVE;
      db.updateTenantStatus(tenant.id, newStatus);
      // Force React to re-render by creating a new array reference
      setTenants([...db.getAllTenants()]); 
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = tenants.filter(t => t.status === TenantStatus.ACTIVE).length;
  const blockedCount = tenants.filter(t => t.status === TenantStatus.BLOCKED_PAYMENT).length;

  return (
    <div className="min-h-screen bg-[#0A0A0B] p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-border pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
             <ShieldCheck className="text-red-500" size={32} />
          </div>
          <div>
             <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin</h1>
             <p className="text-textMedium text-sm">Gestão de SaaS e Kill Switch</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-white font-bold">{activeCount} Ativas</p>
                <p className="text-danger text-sm">{blockedCount} Bloqueadas</p>
            </div>
            <button onClick={logout} className="bg-surface border border-border hover:bg-white/5 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <LogOut size={18} /> <span className="hidden md:inline">Sair</span>
            </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="max-w-2xl mb-6 relative">
          <Search className="absolute left-3 top-3 text-textMedium" size={20} />
          <input 
            type="text" 
            placeholder="Buscar barbearia por nome ou ID..." 
            className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {/* Tenants Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left">
              <thead className="bg-[#111] text-textMedium text-xs uppercase font-semibold border-b border-border">
                  <tr>
                      <th className="p-4">Barbearia</th>
                      <th className="p-4 hidden md:table-cell">Plano</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Ações (Kill Switch)</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-border">
                  {filteredTenants.map(tenant => (
                      <tr key={tenant.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4">
                              <p className="font-bold text-white text-base">{tenant.name}</p>
                              <p className="text-xs text-textMedium font-mono mt-0.5 opacity-50">{tenant.id}</p>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                              <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                  tenant.plan === 'GOLD' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                  tenant.plan === 'SILVER' ? 'bg-gray-400/10 text-gray-400 border-gray-400/20' : 
                                  'bg-orange-700/10 text-orange-700 border-orange-700/20'
                              }`}>
                                  {tenant.plan}
                              </span>
                          </td>
                          <td className="p-4">
                              {tenant.status === TenantStatus.ACTIVE ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                      ATIVO
                                  </span>
                              ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                      <Lock size={10} />
                                      BLOQUEADO
                                  </span>
                              )}
                          </td>
                          <td className="p-4 text-right">
                              {tenant.status === TenantStatus.ACTIVE ? (
                                  <button 
                                    onClick={() => handleToggleStatus(tenant)}
                                    className="bg-background border border-border hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 text-textMedium px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ml-auto"
                                    title="Bloquear acesso por inadimplência"
                                  >
                                      <Lock size={16} /> Bloquear
                                  </button>
                              ) : (
                                  <button 
                                    onClick={() => handleToggleStatus(tenant)}
                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ml-auto shadow-lg shadow-green-900/20"
                                    title="Liberar acesso"
                                  >
                                      <Unlock size={16} /> Liberar Acesso
                                  </button>
                              )}
                          </td>
                      </tr>
                  ))}
                  {filteredTenants.length === 0 && (
                      <tr>
                          <td colSpan={4} className="p-12 text-center text-textMedium">
                              Nenhum cliente/barbearia encontrada. O banco de dados está vazio.
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [view, setView] = useState<'login' | 'register'>('login');

  if (!user) {
    if (view === 'register') {
        return <RegisterScreen onBack={() => setView('login')} />;
    }
    return <LoginScreen onGoToRegister={() => setView('register')} />;
  }

  // Handle Super Admin Route
  if (user.role === UserRole.SUPER_ADMIN) {
    return <SuperAdminDashboard />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'scheduler' && <Scheduler />}
      {activeTab === 'financials' && <Financials />}
      {activeTab === 'customers' && <CustomerManager />}
      {activeTab === 'services' && <ServicesManager />}
      {activeTab === 'team' && <TeamManager />}
      {activeTab === 'settings' && (
          <div className="flex items-center justify-center h-[50vh] text-textMedium flex-col">
              <p>Configurações da Barbearia</p>
          </div>
      )}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
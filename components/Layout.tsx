import React from 'react';
import { useAuth } from '../services/authContext';
import { UserRole } from '../types';
import { LayoutDashboard, Calendar, DollarSign, Users, Settings, LogOut, Scissors, Briefcase } from 'lucide-react';
import { TenantGuard } from './TenantGuard';

interface LayoutProps {
  children?: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout = ({ children, activeTab, setActiveTab }: LayoutProps) => {
  const { user, logout, tenant } = useAuth();

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: [UserRole.OWNER, UserRole.BARBER] },
    { id: 'scheduler', icon: <Calendar size={20} />, label: 'Agenda', roles: [UserRole.OWNER, UserRole.BARBER] },
    { id: 'financials', icon: <DollarSign size={20} />, label: 'Financeiro', roles: [UserRole.OWNER] },
    { id: 'customers', icon: <Users size={20} />, label: 'Clientes', roles: [UserRole.OWNER, UserRole.BARBER] },
    { id: 'services', icon: <Scissors size={20} />, label: 'Serviços', roles: [UserRole.OWNER] },
    { id: 'team', icon: <Briefcase size={20} />, label: 'Equipe', roles: [UserRole.OWNER] },
  ];

  // Filter items based on user role
  const visibleItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-background text-textHigh overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-surface">
        <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Scissors className="text-white" size={18} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">BarberPro</h1>
            </div>
            {tenant && <p className="mt-2 text-xs text-textMedium uppercase tracking-wider">{tenant.name}</p>}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {visibleItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        activeTab === item.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-textMedium hover:text-white hover:bg-white/5'
                    }`}
                >
                    {item.icon}
                    <span className="font-medium text-sm">{item.label}</span>
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 p-2 mb-2">
                <img src={user?.avatarUrl} className="w-8 h-8 rounded-full bg-border" alt="Profile" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-textMedium truncate">{user?.email}</p>
                </div>
            </div>
            <button 
                onClick={logout}
                className="w-full flex items-center gap-2 text-textMedium hover:text-danger px-2 py-2 text-sm transition-colors"
            >
                <LogOut size={16} />
                Sair
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden h-16 border-b border-border bg-surface flex items-center justify-between px-4 z-20">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Scissors className="text-white" size={18} />
                </div>
                <span className="font-bold text-lg">BarberPro</span>
            </div>
            <button onClick={logout}>
                <img src={user?.avatarUrl} className="w-8 h-8 rounded-full border border-border" alt="Profile" />
            </button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
            <TenantGuard>
                {children}
            </TenantGuard>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-surface border-t border-border h-16 flex items-center justify-around z-30 pb-safe">
             {visibleItems.slice(0, 4).map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center gap-1 p-2 ${
                        activeTab === item.id ? 'text-primary' : 'text-textMedium'
                    }`}
                >
                    {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
                    <span className="text-[10px] font-medium">{item.label}</span>
                </button>
            ))}
             <button
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center gap-1 p-2 ${
                    activeTab === 'settings' ? 'text-primary' : 'text-textMedium'
                }`}
            >
                <Settings size={24} />
                <span className="text-[10px] font-medium">Config</span>
            </button>
        </div>
      </main>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useAuth } from '../services/authContext';
import { Appointment, User, UserRole, Service, Client, AppointmentStatus } from '../types';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, Scissors, Smartphone, Plus, X, Check, DollarSign, Calendar } from 'lucide-react';

export const Scheduler = () => {
  const { tenant, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<User[]>([]);
  
  // Modals
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [newAppt, setNewAppt] = useState({
    clientId: '', serviceId: '', barberId: '', time: '10:00'
  });

  const loadData = () => {
    if (!tenant || !user) return;
    
    // Privacy Logic: Filter Barbers
    const allUsers = db.getUsersByTenant(tenant.id);
    let visibleBarbersList = [];

    if (user.role === UserRole.BARBER) {
        // Strict Privacy: Barber only sees themselves
        visibleBarbersList = allUsers.filter(u => u.id === user.id);
    } else {
        // Owner sees all barbers
        visibleBarbersList = allUsers.filter(u => u.role === UserRole.BARBER || u.role === UserRole.OWNER);
    }
    setBarbers(visibleBarbersList);

    // Privacy Logic: Load Appointments
    let allApps = db.getAppointments(tenant.id);
    if (user.role === UserRole.BARBER) {
        // RLS Simulation: Only my appointments
        allApps = allApps.filter(a => a.barberId === user.id);
    }

    const todayApps = allApps.filter(a => {
        const appDate = new Date(a.startTime);
        return appDate.toDateString() === selectedDate.toDateString();
    });
    setAppointments(todayApps);

    setServices(db.getServices(tenant.id));
    setClients(db.getClients(tenant.id));
  };

  useEffect(() => {
    loadData();
  }, [tenant, selectedDate, isNewOpen, selectedAppt]);

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    try {
        const service = services.find(s => s.id === newAppt.serviceId);
        const client = clients.find(c => c.id === newAppt.clientId);
        if (!service || !client) return;

        const [hours, minutes] = newAppt.time.split(':').map(Number);
        const start = setMinutes(setHours(selectedDate, hours), minutes);
        const end = setMinutes(setHours(selectedDate, hours), minutes + service.durationMinutes);

        db.createAppointment({
            tenantId: tenant.id,
            clientId: client.id,
            clientName: client.name,
            clientPhone: client.phone,
            barberId: user?.role === UserRole.BARBER ? user.id : newAppt.barberId, // Barber forces own ID
            serviceId: service.id,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            status: AppointmentStatus.PENDING,
            price: service.price
        });

        setIsNewOpen(false);
        setNewAppt({ clientId: '', serviceId: '', barberId: '', time: '10:00' });
        loadData();
    } catch (err: any) {
        alert(err.message);
    }
  };

  const handleCompleteService = () => {
      if (!selectedAppt) return;
      try {
          db.completeAppointment(selectedAppt.id);
          setSelectedAppt(null); // Close modal
          loadData(); // Refresh grid
      } catch (err: any) {
          alert(err.message);
      }
  };

  const handleCancelService = () => {
    if (!selectedAppt) return;
    if (confirm('Cancelar agendamento?')) {
        db.cancelAppointment(selectedAppt.id);
        setSelectedAppt(null);
        loadData();
    }
  };

  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 9); // 9h to 21h

  return (
    <div className="flex flex-col h-full bg-background pb-20 md:pb-0 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-2xl font-bold text-white">Agenda</h1>
            <p className="text-textMedium">
                {user?.role === UserRole.BARBER ? 'Meus Atendimentos' : 'Visão Geral'}
            </p>
        </div>
        <div className="flex gap-4">
             <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border">
                <button 
                    onClick={() => setSelectedDate(d => addDays(d, -1))}
                    className="p-2 hover:bg-white/10 rounded-md text-textMedium hover:text-white"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="px-4 font-medium text-white min-w-[140px] text-center">
                    {format(selectedDate, "EEE, d 'de' MMM", { locale: ptBR })}
                </div>
                <button 
                    onClick={() => setSelectedDate(d => addDays(d, 1))}
                    className="p-2 hover:bg-white/10 rounded-md text-textMedium hover:text-white"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
            <button 
                onClick={() => setIsNewOpen(true)}
                className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
                <Plus size={20} /> <span className="hidden md:inline">Novo</span>
            </button>
        </div>
      </div>

      {/* Scheduler Grid */}
      <div className="bg-surface border border-border rounded-xl flex-1 overflow-hidden flex flex-col">
          {/* Header Barbers */}
          <div className="grid grid-cols-[60px_1fr] border-b border-border bg-background/50">
              <div className="p-4 border-r border-border flex items-center justify-center">
                  <Clock size={16} className="text-textMedium" />
              </div>
              <div className="overflow-x-auto hide-scrollbar">
                  <div className="flex min-w-full">
                      {barbers.map(barber => (
                          <div key={barber.id} className="flex-1 min-w-[150px] p-4 text-center border-r border-border last:border-0">
                              <div className="flex flex-col items-center gap-2">
                                  <img src={barber.avatarUrl} alt={barber.name} className="w-8 h-8 rounded-full border border-primary/30" />
                                  <span className="text-sm font-medium text-white truncate w-full">{barber.name}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Grid */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-[60px_1fr]">
                  {/* Time Column */}
                  <div className="border-r border-border bg-background/30">
                      {timeSlots.map(hour => (
                          <div key={hour} className="h-24 border-b border-border flex items-start justify-center pt-2">
                              <span className="text-xs text-textMedium font-mono">{hour}:00</span>
                          </div>
                      ))}
                  </div>

                  {/* Appointments Columns */}
                  <div className="flex min-w-full relative">
                       {/* Vertical Grid Lines */}
                      <div className="absolute inset-0 flex pointer-events-none">
                         {barbers.map((_, idx) => (
                             <div key={idx} className="flex-1 border-r border-border last:border-0 h-full opacity-50"></div>
                         ))}
                      </div>

                       {/* Slots Content */}
                       {barbers.map(barber => (
                           <div key={barber.id} className="flex-1 min-w-[150px] relative">
                               {appointments.filter(apt => apt.barberId === barber.id && apt.status !== AppointmentStatus.CANCELED).map(apt => {
                                   const startDate = new Date(apt.startTime);
                                   const startHour = startDate.getHours();
                                   const startMin = startDate.getMinutes();
                                   
                                   const startMinutesFrom9 = (startHour - 9) * 60 + startMin;
                                   const top = (startMinutesFrom9 / 60) * 96; 
                                   
                                   const service = services.find(s => s.id === apt.serviceId);
                                   const duration = service ? service.durationMinutes : 30;
                                   const height = (duration / 60) * 96;

                                   // Status Colors
                                   const isCompleted = apt.status === AppointmentStatus.COMPLETED;
                                   const baseColor = isCompleted 
                                     ? 'bg-green-500/20 border-green-500 hover:bg-green-500/30' 
                                     : 'bg-yellow-500/10 border-yellow-500 hover:bg-yellow-500/20';
                                   const textColor = isCompleted ? 'text-green-500' : 'text-yellow-500';

                                   return (
                                       <div 
                                        key={apt.id}
                                        onClick={() => setSelectedAppt(apt)}
                                        className={`absolute left-1 right-1 p-2 rounded-lg border-l-4 transition cursor-pointer group z-10 ${baseColor}`}
                                        style={{ top: `${top}px`, height: `${height}px`, minHeight: '40px' }}
                                       >
                                           <div className="flex justify-between items-start mb-1">
                                               <span className={`text-xs font-bold truncate ${textColor}`}>{apt.clientName}</span>
                                               {isCompleted && <Check size={12} className="text-green-500" />}
                                           </div>
                                            {height > 50 && (
                                                <div className="flex items-center gap-1 text-xs text-textHigh/80">
                                                    <Scissors size={10} />
                                                    <span className="truncate">{apt.serviceName}</span>
                                                </div>
                                            )}
                                       </div>
                                   )
                               })}
                           </div>
                       ))}
                  </div>
              </div>
          </div>
      </div>

      {/* NEW APPOINTMENT MODAL */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Novo Agendamento</h2>
                    <button onClick={() => setIsNewOpen(false)} className="text-textMedium hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSaveAppointment} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs text-textMedium block mb-1">Cliente</label>
                            <select 
                                required className="w-full bg-background border border-border rounded-lg p-2 text-white"
                                value={newAppt.clientId} onChange={e => setNewAppt({...newAppt, clientId: e.target.value})}
                            >
                                <option value="">Selecione...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="text-xs text-textMedium block mb-1">Barbeiro</label>
                            {user?.role === UserRole.BARBER ? (
                                <div className="p-2 bg-background border border-border rounded-lg text-white opacity-50 cursor-not-allowed">
                                    {user.name}
                                </div>
                            ) : (
                                <select 
                                    required className="w-full bg-background border border-border rounded-lg p-2 text-white"
                                    value={newAppt.barberId} onChange={e => setNewAppt({...newAppt, barberId: e.target.value})}
                                >
                                    <option value="">Selecione...</option>
                                    {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs text-textMedium block mb-1">Serviço</label>
                         <select 
                                required className="w-full bg-background border border-border rounded-lg p-2 text-white"
                                value={newAppt.serviceId} onChange={e => setNewAppt({...newAppt, serviceId: e.target.value})}
                            >
                                <option value="">Selecione...</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                            </select>
                    </div>

                    <div>
                        <label className="text-xs text-textMedium block mb-1">Horário (Hoje)</label>
                        <input 
                            type="time" required className="w-full bg-background border border-border rounded-lg p-2 text-white"
                            value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})}
                        />
                    </div>

                    <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-lg mt-4">
                        Confirmar Agendamento
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* APPOINTMENT DETAILS / CHECKOUT MODAL */}
      {selectedAppt && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
              <div className="bg-surface border-t md:border border-border w-full max-w-md md:rounded-2xl rounded-t-2xl p-6 shadow-2xl animate-slide-up">
                  <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
                      <div>
                          <h2 className="text-xl font-bold text-white">{selectedAppt.clientName}</h2>
                          <div className="flex items-center gap-2 text-textMedium text-sm mt-1">
                              <Smartphone size={14} /> {selectedAppt.clientPhone}
                          </div>
                      </div>
                      <button onClick={() => setSelectedAppt(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                          <X size={20} className="text-white" />
                      </button>
                  </div>

                  <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Scissors size={18} /></div>
                              <div>
                                  <p className="text-white font-medium">{selectedAppt.serviceName}</p>
                                  <p className="text-xs text-textMedium">Serviço</p>
                              </div>
                          </div>
                          <span className="text-white font-bold">R$ {selectedAppt.price.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Calendar size={18} /></div>
                              <div>
                                  <p className="text-white font-medium">
                                    {format(new Date(selectedAppt.startTime), 'HH:mm')} - {format(new Date(selectedAppt.endTime), 'HH:mm')}
                                  </p>
                                  <p className="text-xs text-textMedium">Hoje</p>
                              </div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                              selectedAppt.status === AppointmentStatus.COMPLETED ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                              {selectedAppt.status === AppointmentStatus.COMPLETED ? 'Concluído' : 'Agendado'}
                          </div>
                      </div>
                  </div>

                  {selectedAppt.status !== AppointmentStatus.COMPLETED ? (
                      <div className="space-y-3">
                          <button 
                            onClick={handleCompleteService}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                          >
                              <Check size={20} /> FINALIZAR ATENDIMENTO (R$ {selectedAppt.price})
                          </button>
                          <button 
                             onClick={handleCancelService}
                             className="w-full bg-background border border-border text-danger hover:bg-danger/10 font-medium py-3 rounded-xl"
                          >
                              Cancelar Agendamento
                          </button>
                      </div>
                  ) : (
                      <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl text-center">
                          <p className="text-green-500 font-bold flex items-center justify-center gap-2">
                              <Check size={20} /> Serviço Finalizado
                          </p>
                          <p className="text-xs text-green-400/80 mt-1">Comissão calculada e saldo atualizado.</p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};
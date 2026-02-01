import { User, Tenant, Service, Client, Appointment, UserRole, TenantStatus, AppointmentStatus } from '../types';

// Initial DB State - CLEAN (No Fake Data)
const INITIAL_DB = {
  tenants: [] as Tenant[],
  users: [] as User[],
  services: [] as Service[],
  clients: [] as Client[],
  appointments: [] as Appointment[]
};

// Helper to load/save from localStorage
const loadDB = () => {
  const stored = localStorage.getItem('barberpro_db');
  return stored ? JSON.parse(stored) : INITIAL_DB;
};

const saveDB = (db: typeof INITIAL_DB) => {
  localStorage.setItem('barberpro_db', JSON.stringify(db));
};

export const db = {
  // Auth & Tenants
  findUserByEmail: (email: string) => {
    const db = loadDB();
    return db.users.find((u: User) => u.email === email);
  },

  getTenant: (tenantId: string) => {
    const db = loadDB();
    return db.tenants.find((t: Tenant) => t.id === tenantId);
  },

  // ADMIN METHODS
  getAllTenants: () => {
    const db = loadDB();
    return db.tenants;
  },

  updateTenantStatus: (tenantId: string, status: TenantStatus) => {
    const db = loadDB();
    const index = db.tenants.findIndex((t: Tenant) => t.id === tenantId);
    if (index !== -1) {
      db.tenants[index].status = status;
      saveDB(db);
    }
  },

  createTenantAndOwner: (shopName: string, ownerName: string, email: string, password: string) => {
    const db = loadDB();
    if (db.users.find((u: User) => u.email === email)) throw new Error('E-mail já cadastrado.');

    const tenantId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      id: tenantId, name: shopName, status: TenantStatus.ACTIVE, plan: 'BRONZE', currency: 'BRL'
    };

    const newUser: User = {
      id: `user-${Date.now()}`, name: ownerName, email, password, role: UserRole.OWNER,
      tenantId, walletBalance: 0, commissionRate: 0,
      avatarUrl: `https://ui-avatars.com/api/?name=${ownerName}`
    };

    db.tenants.push(newTenant);
    db.users.push(newUser);
    saveDB(db);
    return newUser;
  },

  createBarber: (ownerTenantId: string, name: string, email: string, password: string, commissionRate: number) => {
    const db = loadDB();
    if (db.users.find((u: User) => u.email === email)) throw new Error('E-mail já existe.');

    const newUser: User = {
      id: `user-${Date.now()}`, name, email, password, role: UserRole.BARBER,
      tenantId: ownerTenantId, walletBalance: 0, commissionRate: commissionRate,
      avatarUrl: `https://ui-avatars.com/api/?name=${name}`
    };
    
    db.users.push(newUser);
    saveDB(db);
    return newUser;
  },

  getUsersByTenant: (tenantId: string) => {
    const db = loadDB();
    return db.users.filter((u: User) => u.tenantId === tenantId);
  },

  // Services
  getServices: (tenantId: string) => {
    const db = loadDB();
    return db.services.filter((s: Service) => s.tenantId === tenantId);
  },

  addService: (tenantId: string, service: Omit<Service, 'id' | 'tenantId'>) => {
    const db = loadDB();
    const newService = { ...service, id: `srv-${Date.now()}`, tenantId };
    db.services.push(newService);
    saveDB(db);
    return newService;
  },

  deleteService: (serviceId: string) => {
    const db = loadDB();
    db.services = db.services.filter((s: Service) => s.id !== serviceId);
    saveDB(db);
  },

  // Clients
  getClients: (tenantId: string) => {
    const db = loadDB();
    return db.clients.filter((c: Client) => c.tenantId === tenantId);
  },

  addClient: (tenantId: string, client: Omit<Client, 'id' | 'tenantId' | 'createdAt'>) => {
    const db = loadDB();
    const newClient = { ...client, id: `cli-${Date.now()}`, tenantId, createdAt: new Date().toISOString() };
    db.clients.push(newClient);
    saveDB(db);
    return newClient;
  },

  // Appointments
  getAppointments: (tenantId: string) => {
    const db = loadDB();
    return db.appointments.filter((a: Appointment) => a.tenantId === tenantId);
  },

  createAppointment: (appointment: Omit<Appointment, 'id' | 'serviceName' | 'commissionValue'>) => {
    const db = loadDB();
    // Validate concurrency
    const hasConflict = db.appointments.some((a: Appointment) => {
      if (a.barberId !== appointment.barberId) return false;
      if (a.status === AppointmentStatus.CANCELED) return false;
      const newStart = new Date(appointment.startTime).getTime();
      const newEnd = new Date(appointment.endTime).getTime();
      const existStart = new Date(a.startTime).getTime();
      const existEnd = new Date(a.endTime).getTime();
      return (newStart < existEnd && newEnd > existStart);
    });

    if (hasConflict) throw new Error('Horário indisponível para este barbeiro.');

    const service = db.services.find((s: Service) => s.id === appointment.serviceId);
    if (!service) throw new Error('Serviço não encontrado');

    const newAppt = { 
      ...appointment, 
      id: `apt-${Date.now()}`,
      serviceName: service.name,
      price: service.price,
      commissionValue: 0 // Will be calculated at completion
    };
    db.appointments.push(newAppt);
    saveDB(db);
    return newAppt;
  },

  // IMPORTANT: The Core Financial Logic
  completeAppointment: (appointmentId: string) => {
    const db = loadDB();
    const apptIndex = db.appointments.findIndex((a: Appointment) => a.id === appointmentId);
    
    if (apptIndex === -1) throw new Error('Agendamento não encontrado');
    
    const appt = db.appointments[apptIndex];
    if (appt.status === AppointmentStatus.COMPLETED) return appt; // Idempotency

    // Find barber to get Commission Rate
    const barber = db.users.find((u: User) => u.id === appt.barberId);
    if (!barber) throw new Error('Barbeiro não encontrado');

    // Logic: Calculate commission based on Barber's User Profile Rate
    const rate = barber.commissionRate || 0;
    const commissionVal = (appt.price * rate) / 100;

    // Update Appointment
    const updatedAppt = {
      ...appt,
      status: AppointmentStatus.COMPLETED,
      commissionValue: commissionVal
    };

    db.appointments[apptIndex] = updatedAppt;
    saveDB(db);
    return updatedAppt;
  },

  cancelAppointment: (appointmentId: string) => {
    const db = loadDB();
    const apptIndex = db.appointments.findIndex((a: Appointment) => a.id === appointmentId);
    if (apptIndex !== -1) {
        db.appointments[apptIndex].status = AppointmentStatus.CANCELED;
        saveDB(db);
    }
  }
};
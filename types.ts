export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OWNER = 'OWNER',
  BARBER = 'BARBER'
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED_PAYMENT = 'BLOCKED_PAYMENT', // The "Kill Switch" state
  TRIAL = 'TRIAL'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  NO_SHOW = 'NO_SHOW'
}

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  plan: 'BRONZE' | 'SILVER' | 'GOLD';
  currency: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  tenantId?: string; 
  password?: string; 
  walletBalance: number;
  commissionRate?: number; // Configurable per barber (0-100)
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  durationMinutes: number;
  commissionRate: number; // Default service commission (can be overridden by user commission if logic dictates, currently using User rate as priority in new flow)
}

export interface Appointment {
  id: string;
  tenantId: string;
  clientName: string; 
  clientPhone: string; 
  clientId?: string;
  serviceId: string;
  serviceName: string; // Snapshot for history
  barberId: string;
  startTime: string; 
  endTime: string; 
  status: AppointmentStatus;
  notes?: string;
  price: number; // Final price snapshot
  commissionValue: number; // Calculated at completion
}

export interface FinancialRecord {
  id: string;
  tenantId: string;
  type: 'INCOME' | 'COMMISSION_PAYOUT' | 'EXPENSE';
  amount: number;
  date: string;
  description: string;
  status: 'PENDING' | 'PAID';
}
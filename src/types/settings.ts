
export interface BusinessSettings {
  id: string;
  name: string;
  rnc: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxRate: number;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptSettings {
  id: string;
  header: string;
  footer: string;
  copies: number;
  width: number;
  showLogo: boolean;
  showTax: boolean;
  showBarcode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface SystemSettings {
  id: string;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  autoBackup: boolean;
  dataRetention: number; // days
  maintenanceMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountsReceivable {
  id: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid' | 'partial';
  paidAmount: number;
  remainingAmount: number;
  description: string;
  createdAt: string;
}

export interface AccountsPayable {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid' | 'partial';
  paidAmount: number;
  remainingAmount: number;
  description: string;
  createdAt: string;
}

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
  receiptPrefix?: string;
  accessKeys?: {
    [key: string]: string;
  };
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

export interface PaymentRecord {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'check';
  reference?: string;
  notes?: string;
  userId: string;
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
  paymentHistory: PaymentRecord[];
  saleId?: string; // Link to original sale if applicable
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
  paymentHistory: PaymentRecord[];
  purchaseId?: string; // Link to original purchase if applicable
}

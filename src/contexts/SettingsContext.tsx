import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  BusinessSettings, 
  ReceiptSettings, 
  SystemUser, 
  SystemSettings, 
  AccountsReceivable, 
  AccountsPayable,
  PaymentRecord
} from '@/types/settings';
import { toast } from 'sonner';

interface SettingsContextType {
  // Business Settings
  businessSettings: BusinessSettings | null;
  updateBusinessSettings: (settings: Partial<BusinessSettings>) => void;
  
  // Receipt Settings
  receiptSettings: ReceiptSettings | null;
  updateReceiptSettings: (settings: Partial<ReceiptSettings>) => void;
  
  // System Settings
  systemSettings: SystemSettings | null;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  
  // User Management
  systemUsers: SystemUser[];
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteUser: (id: string) => void;
  
  // Accounts Receivable
  accountsReceivable: AccountsReceivable[];
  addAccountReceivable: (account: Omit<AccountsReceivable, 'id' | 'createdAt' | 'paymentHistory'>) => void;
  updateAccountReceivable: (id: string, updates: Partial<AccountsReceivable>) => void;
  addReceivablePayment: (accountId: string, payment: Omit<PaymentRecord, 'id'>) => void;
  
  // Accounts Payable
  accountsPayable: AccountsPayable[];
  addAccountPayable: (account: Omit<AccountsPayable, 'id' | 'createdAt' | 'paymentHistory'>) => void;
  updateAccountPayable: (id: string, updates: Partial<AccountsPayable>) => void;
  addPayablePayment: (accountId: string, payment: Omit<PaymentRecord, 'id'>) => void;
  
  // Auto Integration Functions
  createReceivableFromCreditSale: (saleId: string, customerId: string, customerName: string, amount: number, dueDate: string) => void;
  createPayableFromPurchase: (purchaseId: string, supplierId: string, supplierName: string, amount: number, dueDate: string) => void;
  
  // System Actions
  createBackup: () => void;
  restoreBackup: (file: File) => void;
  clearSalesData: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Initialize with default settings
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    id: '1',
    name: 'Mi Negocio POS',
    rnc: '',
    address: '',
    phone: '',
    email: '',
    currency: 'RD$',
    taxRate: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    id: '1',
    header: '¡Gracias por su compra!',
    footer: 'Esperamos verle pronto nuevamente',
    copies: 1,
    width: 80,
    showLogo: true,
    showTax: true,
    showBarcode: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    id: '1',
    backupFrequency: 'daily',
    autoBackup: true,
    dataRetention: 365,
    maintenanceMode: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([
    {
      id: '1',
      name: 'Administrador',
      email: 'admin@pos.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  ]);

  const [accountsReceivable, setAccountsReceivable] = useState<AccountsReceivable[]>([]);
  const [accountsPayable, setAccountsPayable] = useState<AccountsPayable[]>([]);

  // Business Settings
  const updateBusinessSettings = (settings: Partial<BusinessSettings>) => {
    setBusinessSettings(prev => prev ? {
      ...prev,
      ...settings,
      updatedAt: new Date().toISOString()
    } : prev);
    toast.success('Configuración del negocio actualizada');
  };

  // Receipt Settings
  const updateReceiptSettings = (settings: Partial<ReceiptSettings>) => {
    setReceiptSettings(prev => prev ? {
      ...prev,
      ...settings,
      updatedAt: new Date().toISOString()
    } : prev);
    toast.success('Configuración de recibos actualizada');
  };

  // System Settings
  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    setSystemSettings(prev => prev ? {
      ...prev,
      ...settings,
      updatedAt: new Date().toISOString()
    } : prev);
    toast.success('Configuración del sistema actualizada');
  };

  // User Management
  const addUser = (user: Omit<SystemUser, 'id' | 'createdAt'>) => {
    const newUser: SystemUser = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setSystemUsers(prev => [...prev, newUser]);
    toast.success('Usuario agregado exitosamente');
  };

  const updateUser = (id: string, updates: Partial<SystemUser>) => {
    setSystemUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
    toast.success('Usuario actualizado');
  };

  const deleteUser = (id: string) => {
    setSystemUsers(prev => prev.filter(user => user.id !== id));
    toast.success('Usuario eliminado');
  };

  // Enhanced Accounts Receivable functions
  const addAccountReceivable = (account: Omit<AccountsReceivable, 'id' | 'createdAt' | 'paymentHistory'>) => {
    const newAccount: AccountsReceivable = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      paymentHistory: []
    };
    setAccountsReceivable(prev => [...prev, newAccount]);
    toast.success('Cuenta por cobrar agregada');
  };

  const updateAccountReceivable = (id: string, updates: Partial<AccountsReceivable>) => {
    setAccountsReceivable(prev => prev.map(account =>
      account.id === id ? { ...account, ...updates } : account
    ));
    toast.success('Cuenta por cobrar actualizada');
  };

  const addReceivablePayment = (accountId: string, payment: Omit<PaymentRecord, 'id'>) => {
    if (!currentUser) return;

    const newPayment: PaymentRecord = {
      ...payment,
      id: Date.now().toString(),
      userId: currentUser.id
    };

    setAccountsReceivable(prev => prev.map(account => {
      if (account.id === accountId) {
        const newPaidAmount = account.paidAmount + payment.amount;
        const newRemainingAmount = account.amount - newPaidAmount;
        const newStatus = newRemainingAmount <= 0 ? 'paid' : 
                         newPaidAmount > 0 ? 'partial' : 'pending';

        return {
          ...account,
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: newStatus,
          paymentHistory: [...account.paymentHistory, newPayment]
        };
      }
      return account;
    }));

    toast.success('Pago registrado exitosamente');
  };

  // Enhanced Accounts Payable functions
  const addAccountPayable = (account: Omit<AccountsPayable, 'id' | 'createdAt' | 'paymentHistory'>) => {
    const newAccount: AccountsPayable = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      paymentHistory: []
    };
    setAccountsPayable(prev => [...prev, newAccount]);
    toast.success('Cuenta por pagar agregada');
  };

  const updateAccountPayable = (id: string, updates: Partial<AccountsPayable>) => {
    setAccountsPayable(prev => prev.map(account =>
      account.id === id ? { ...account, ...updates } : account
    ));
    toast.success('Cuenta por pagar actualizada');
  };

  const addPayablePayment = (accountId: string, payment: Omit<PaymentRecord, 'id'>) => {
    if (!currentUser) return;

    const newPayment: PaymentRecord = {
      ...payment,
      id: Date.now().toString(),
      userId: currentUser.id
    };

    setAccountsPayable(prev => prev.map(account => {
      if (account.id === accountId) {
        const newPaidAmount = account.paidAmount + payment.amount;
        const newRemainingAmount = account.amount - newPaidAmount;
        const newStatus = newRemainingAmount <= 0 ? 'paid' : 
                         newPaidAmount > 0 ? 'partial' : 'pending';

        return {
          ...account,
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: newStatus,
          paymentHistory: [...account.paymentHistory, newPayment]
        };
      }
      return account;
    }));

    toast.success('Pago registrado exitosamente');
  };

  // Auto Integration Functions
  const createReceivableFromCreditSale = (saleId: string, customerId: string, customerName: string, amount: number, dueDate: string) => {
    const newAccount: AccountsReceivable = {
      id: Date.now().toString(),
      customerId,
      customerName,
      invoiceNumber: saleId,
      amount,
      dueDate,
      status: 'pending',
      paidAmount: 0,
      remainingAmount: amount,
      description: `Venta a crédito - ${saleId}`,
      createdAt: new Date().toISOString(),
      paymentHistory: [],
      saleId
    };
    
    setAccountsReceivable(prev => [...prev, newAccount]);
    console.log(`Cuenta por cobrar creada automáticamente para venta a crédito: ${saleId}`);
  };

  const createPayableFromPurchase = (purchaseId: string, supplierId: string, supplierName: string, amount: number, dueDate: string) => {
    const newAccount: AccountsPayable = {
      id: Date.now().toString(),
      supplierId,
      supplierName,
      invoiceNumber: purchaseId,
      amount,
      dueDate,
      status: 'pending',
      paidAmount: 0,
      remainingAmount: amount,
      description: `Compra a crédito - ${purchaseId}`,
      createdAt: new Date().toISOString(),
      paymentHistory: [],
      purchaseId
    };
    
    setAccountsPayable(prev => [...prev, newAccount]);
    console.log(`Cuenta por pagar creada automáticamente para compra: ${purchaseId}`);
  };

  // System Actions
  const createBackup = () => {
    const data = {
      businessSettings,
      receiptSettings,
      systemSettings,
      systemUsers,
      accountsReceivable,
      accountsPayable,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Respaldo creado exitosamente');
  };

  const restoreBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.businessSettings) setBusinessSettings(data.businessSettings);
        if (data.receiptSettings) setReceiptSettings(data.receiptSettings);
        if (data.systemSettings) setSystemSettings(data.systemSettings);
        if (data.systemUsers) setSystemUsers(data.systemUsers);
        if (data.accountsReceivable) setAccountsReceivable(data.accountsReceivable);
        if (data.accountsPayable) setAccountsPayable(data.accountsPayable);
        
        toast.success('Datos restaurados exitosamente');
      } catch (error) {
        toast.error('Error al restaurar el archivo');
      }
    };
    reader.readAsText(file);
  };

  const clearSalesData = () => {
    toast.success('Datos de ventas limpiados');
  };

  return (
    <SettingsContext.Provider value={{
      businessSettings,
      updateBusinessSettings,
      receiptSettings,
      updateReceiptSettings,
      systemSettings,
      updateSystemSettings,
      systemUsers,
      addUser,
      updateUser,
      deleteUser,
      accountsReceivable,
      addAccountReceivable,
      updateAccountReceivable,
      addReceivablePayment,
      accountsPayable,
      addAccountPayable,
      updateAccountPayable,
      addPayablePayment,
      createReceivableFromCreditSale,
      createPayableFromPurchase,
      createBackup,
      restoreBackup,
      clearSalesData
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

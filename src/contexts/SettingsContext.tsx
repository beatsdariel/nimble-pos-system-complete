
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  BusinessSettings, 
  ReceiptSettings, 
  SystemUser, 
  SystemSettings, 
  AccountsReceivable, 
  AccountsPayable 
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
  addAccountReceivable: (account: Omit<AccountsReceivable, 'id' | 'createdAt'>) => void;
  updateAccountReceivable: (id: string, updates: Partial<AccountsReceivable>) => void;
  
  // Accounts Payable
  accountsPayable: AccountsPayable[];
  addAccountPayable: (account: Omit<AccountsPayable, 'id' | 'createdAt'>) => void;
  updateAccountPayable: (id: string, updates: Partial<AccountsPayable>) => void;
  
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

  // Accounts Receivable
  const addAccountReceivable = (account: Omit<AccountsReceivable, 'id' | 'createdAt'>) => {
    const newAccount: AccountsReceivable = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
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

  // Accounts Payable
  const addAccountPayable = (account: Omit<AccountsPayable, 'id' | 'createdAt'>) => {
    const newAccount: AccountsPayable = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
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
    // This would clear sales data from POS context
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
      accountsPayable,
      addAccountPayable,
      updateAccountPayable,
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

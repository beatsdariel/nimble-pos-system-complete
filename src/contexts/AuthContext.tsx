import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session, CashRegisterEntry, CashClosure, DayClosure } from '@/types/auth';

interface AuthContextType {
  // Authentication
  currentUser: User | null;
  currentSession: Session | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithAccessKey: (userId: string, accessKey: string) => Promise<boolean>;
  logout: () => void;
  
  // Users management
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  searchUsers: (searchTerm: string) => User[];
  generateAccessKey: (userId: string) => string;
  
  // Cash register
  cashEntries: CashRegisterEntry[];
  addCashEntry: (entry: Omit<CashRegisterEntry, 'id' | 'timestamp' | 'sessionId'>) => void;
  
  // Cash closures
  cashClosures: CashClosure[];
  createCashClosure: (closure: Omit<CashClosure, 'id'>) => void;
  
  // Day closures
  dayClosures: DayClosure[];
  createDayClosure: (closure: Omit<DayClosure, 'id' | 'createdAt'>) => void;
  
  // Utilities
  getSessionSales: () => number;
  getSessionExpenses: () => number;
  getExpectedCash: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [cashEntries, setCashEntries] = useState<CashRegisterEntry[]>([]);
  const [cashClosures, setCashClosures] = useState<CashClosure[]>([]);
  const [dayClosures, setDayClosures] = useState<DayClosure[]>([]);

  // Initialize with default users
  useEffect(() => {
    const defaultUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        accessKey: '1234'
      },
      {
        id: '2',
        username: 'empleado1',
        password: 'emp123',
        name: 'Juan Pérez',
        role: 'employee',
        isActive: true,
        createdAt: new Date().toISOString(),
        accessKey: '5678'
      },
      {
        id: '3',
        username: 'empleado2',
        password: 'emp456',
        name: 'María García',
        role: 'employee',
        isActive: true,
        createdAt: new Date().toISOString(),
        accessKey: '9876'
      }
    ];
    setUsers(defaultUsers);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.username === username && u.password === password && u.isActive);
    
    if (user) {
      setCurrentUser(user);
      const session: Session = {
        userId: user.id,
        username: user.username,
        role: user.role,
        startTime: new Date().toISOString(),
        isActive: true
      };
      setCurrentSession(session);
      return true;
    }
    return false;
  };

  const loginWithAccessKey = async (userId: string, accessKey: string): Promise<boolean> => {
    const user = users.find(u => u.id === userId && u.accessKey === accessKey && u.isActive);
    
    if (user) {
      setCurrentUser(user);
      const session: Session = {
        userId: user.id,
        username: user.username,
        role: user.role,
        startTime: new Date().toISOString(),
        isActive: true
      };
      setCurrentSession(session);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, endTime: new Date().toISOString(), isActive: false });
    }
    setCurrentUser(null);
    setCurrentSession(null);
  };

  const searchUsers = (searchTerm: string): User[] => {
    if (!searchTerm.trim()) return users.filter(u => u.isActive);
    
    const term = searchTerm.toLowerCase();
    return users.filter(u => 
      u.isActive && (
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term)
      )
    );
  };

  const generateAccessKey = (userId: string): string => {
    const accessKey = Math.floor(1000 + Math.random() * 9000).toString();
    updateUser(userId, { accessKey });
    return accessKey;
  };

  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      accessKey: Math.floor(1000 + Math.random() * 9000).toString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addCashEntry = (entry: Omit<CashRegisterEntry, 'id' | 'timestamp' | 'sessionId'>) => {
    if (!currentSession || !currentUser) return;
    
    const newEntry: CashRegisterEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      sessionId: currentSession.startTime,
      userId: currentUser.id
    };
    setCashEntries(prev => [...prev, newEntry]);
  };

  const createCashClosure = (closure: Omit<CashClosure, 'id'>) => {
    const newClosure: CashClosure = {
      ...closure,
      id: Date.now().toString()
    };
    setCashClosures(prev => [...prev, newClosure]);
  };

  const createDayClosure = (closure: Omit<DayClosure, 'id' | 'createdAt'>) => {
    const newClosure: DayClosure = {
      ...closure,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setDayClosures(prev => [...prev, newClosure]);
  };

  const getSessionSales = (): number => {
    if (!currentSession) return 0;
    return cashEntries
      .filter(entry => entry.sessionId === currentSession.startTime && entry.type === 'sale')
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getSessionExpenses = (): number => {
    if (!currentSession) return 0;
    return cashEntries
      .filter(entry => entry.sessionId === currentSession.startTime && entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getExpectedCash = (): number => {
    return getSessionSales() - getSessionExpenses();
  };

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentSession,
      isAuthenticated,
      login,
      loginWithAccessKey,
      logout,
      users,
      addUser,
      updateUser,
      deleteUser,
      searchUsers,
      generateAccessKey,
      cashEntries,
      addCashEntry,
      cashClosures,
      createCashClosure,
      dayClosures,
      createDayClosure,
      getSessionSales,
      getSessionExpenses,
      getExpectedCash
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'employee';
  isActive: boolean;
  createdAt: string;
  accessKey?: string; // Clave de acceso de 4 dígitos
}

export interface Session {
  userId: string;
  username: string;
  role: 'admin' | 'employee';
  startTime: string;
  endTime?: string;
  isActive: boolean;
}

export interface CashRegisterEntry {
  id: string;
  type: 'sale' | 'expense' | 'adjustment';
  amount: number;
  description: string;
  userId: string;
  timestamp: string;
  sessionId: string;
}

export interface CashClosure {
  id: string;
  sessionId: string;
  userId: string;
  startTime: string;
  endTime: string;
  expectedCash: number;
  countedCash: number;
  difference: number;
  salesCount: number;
  totalSales: number;
  expenses: number;
  notes?: string;
}

export interface DayClosure {
  id: string;
  date: string;
  totalSales: number;
  totalExpenses: number;
  totalCash: number;
  totalCard: number;
  totalTransactions: number;
  cashClosures: CashClosure[];
  createdBy: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  barcode: string;
  sku: string;
  price: number;
  wholesalePrice?: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  taxRate: number;
  taxType?: 'included' | 'calculated' | 'exempt';
  image?: string;
  supplier?: string;
  isFractional?: boolean;
  unitOfMeasure?: 'caja' | 'paquete' | 'libra' | 'unidad' | 'metro' | 'kilogramo';
  fractionalUnit?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string; // RNC or Cedula
  address?: string;
  totalPurchases?: number;
  lastPurchase?: string;
  creditLimit?: number;
  creditBalance?: number;
  isWholesale?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  taxRate: number;
  isWholesalePrice?: boolean;
  taxType?: 'included' | 'calculated' | 'exempt';
}

export interface PaymentMethod {
  type: 'cash' | 'card' | 'transfer' | 'check' | 'credit' | 'return' | 'credit-note';
  amount: number;
  reference?: string;
  returnId?: string;
  creditNoteId?: string;
  cardType?: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
}

export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  payments: PaymentMethod[];
  customerId?: string;
  userId: string;
  receiptNumber: string;
  status: 'completed' | 'returned' | 'partially-returned' | 'credit' | 'paid-credit';
  returnedItems?: ReturnedItem[];
  dueDate?: string;
}

export interface ReturnedItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  returnReason: string;
  returnDate: string;
  originalSaleId: string;
}

export interface CreditNote {
  id: string;
  customerId?: string;
  originalSaleId: string;
  amount: number;
  balance: number;
  issueDate: string;
  reason: string;
  status: 'active' | 'used' | 'expired';
  returnItems: ReturnedItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'manager';
  permissions?: string[];
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'return';
  quantity: number;
  reason?: string;
  date: string;
  userId: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface CashSession {
  id: string;
  userId: string;
  shiftId: string;
  openingAmount: number;
  openingTime: string;
  closingAmount?: number;
  closingTime?: string;
  status: 'open' | 'closed';
  sales: Sale[];
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  totalCredit: number;
  actualCash?: number;
  actualCard?: number;
  actualTransfer?: number;
  cashDifference?: number;
  cardDifference?: number;
  transferDifference?: number;
}

export interface CashCount {
  cash: number;
  card: number;
  transfer: number;
  notes?: string;
}

export interface HeldOrder {
  id: string;
  items: CartItem[];
  customerId?: string;
  total: number;
  createdAt: string;
  createdBy: string;
  note?: string;
}

export interface InvoiceData {
  type: 'sale' | 'credit-note' | 'return';
  sale: Sale;
  customer?: Customer;
  returnData?: {
    returnAmount: number;
    returnId: string;
    returnItems?: any[];
    returnReason?: string;
  };
}

export interface CashSessionSummary {
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  totalCredit: number;
  openingAmount: number;
  netCashSales: number; // Sales without opening amount
  actualAmounts: {
    cash: number;
    card: number;
    transfer: number;
  };
  differences: {
    cash: number;
    card: number;
    transfer: number;
    total: number;
  };
}


export interface Product {
  id: string;
  name: string;
  description: string;
  barcode: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  taxRate: number;
  image?: string;
  supplier?: string;
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
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  taxRate: number;
  discount?: number;
}

export interface PaymentMethod {
  type: 'cash' | 'card' | 'transfer' | 'check';
  amount: number;
  reference?: string;
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
  type: 'sale' | 'purchase' | 'adjustment';
  quantity: number;
  reason?: string;
  date: string;
  userId: string;
}

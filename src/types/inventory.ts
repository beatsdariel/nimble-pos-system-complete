export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  purchaseNumber: string;
  date: string;
  dueDate?: string;
  status: 'pending' | 'received' | 'partial' | 'cancelled';
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  userId: string;
  notes?: string;
  fiscalReceipt?: boolean;
  fiscalNumber?: string;
  paymentType?: 'cash' | 'credit';
  invoiceNumber?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface InventoryCount {
  id: string;
  date: string;
  status: 'in-progress' | 'completed' | 'cancelled';
  items: InventoryCountItem[];
  userId: string;
  notes?: string;
}

export interface InventoryCountItem {
  productId: string;
  productName: string;
  systemQuantity: number;
  countedQuantity: number;
  difference: number;
  unitCost: number;
  totalCostDifference: number;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalPurchases: number;
  averageMargin: number;
}

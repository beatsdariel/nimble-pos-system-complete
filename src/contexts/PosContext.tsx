import React, { createContext, useState, useContext, useEffect } from 'react';
import { Product, CartItem, Customer, PaymentMethod, Sale, ReturnedItem, CreditNote, User, InventoryMovement, Shift, CashSession, CashCount, HeldOrder, InvoiceData, CashSessionSummary } from '@/types/pos';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

interface PosContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => string;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  getProduct: (productId: string) => Product | undefined;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => string;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  deleteCustomer: (customerId: string) => void;
  createCustomer: (customer: Omit<Customer, 'id'>) => void;
  getCustomer: (customerId: string) => Customer | undefined;

  // Cart management
  cart: CartItem[];
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  addToCart: (productId: string, quantity?: number, forceWholesale?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Sales
  sales: Sale[];
  completeSale: (saleData: any) => Sale;
  getCreditSales: (customerId: string) => Sale[];
  updateCreditSale: (saleId: string, paymentAmount: number, paymentMethod: PaymentMethod) => void;
  processReturn: (saleId: string, returnItems: any[], reason?: string) => string;

  // Credit Notes
  creditNotes: CreditNote[];
  createCreditNote: (creditNoteData: any) => CreditNote;
  getCustomerCreditNotes: (customerId: string) => CreditNote[];

  // Inventory
  inventoryMovements: InventoryMovement[];
  recordInventoryMovement: (productId: string, type: 'sale' | 'purchase' | 'adjustment' | 'return', quantity: number, reason?: string) => void;
  
  // Users and auth
  users: User[];
  currentUser: User | null;

  // Shifts and cash management
  shifts: Shift[];
  cashSessions: CashSession[];
  currentShift: CashSession | null;
  setCurrentShift: React.Dispatch<React.SetStateAction<CashSession | null>>;
  addCashClosure: (closureData: any) => void;

  // Held orders
  heldOrders: HeldOrder[];
  resumeHeldOrder: (orderId: string) => void;
  searchHeldOrders: (searchTerm: string) => HeldOrder[];
  deleteHeldOrder: (orderId: string) => void;
  holdCurrentOrder: (note?: string) => void;

  // Customer selection
  selectedCustomer: string;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<string>>;

  // Last added product tracking
  lastAddedProductId: string | null;
  setLastAddedProductId: React.Dispatch<React.SetStateAction<string | null>>;
  processBarcodeCommand: (input: string) => void;

  // Access validation
  validateAccessKey: (action: string, key: string) => boolean;

  // Suppliers and purchases
  suppliers: any[];
  addSupplier: (supplier: any) => string;
  updateSupplier: (supplierId: string, updates: any) => void;
  purchases: any[];
  addPurchase: (purchase: any) => string;
  updatePurchase: (purchaseId: string, updates: any) => void;

  // Inventory counts
  inventoryCounts: any[];
  addInventoryCount: (count: any) => string;
  updateInventoryCount: (countId: string, updates: any) => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [cashSessions, setCashSessions] = useState<CashSession[]>([]);
  const [currentShift, setCurrentShift] = useState<CashSession | null>(null);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('no-customer');
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [inventoryCounts, setInventoryCounts] = useState<any[]>([]);

  const { currentUser: authUser } = useAuth();
  const { businessSettings } = useSettings();

  const currentUser: User | null = authUser ? {
    id: authUser.id,
    name: authUser.name,
    email: authUser.username + '@system.local', // Provide default email
    role: authUser.role === 'admin' ? 'admin' : 'cashier',
    permissions: authUser.role === 'admin' ? ['all'] : ['sales']
  } : null;

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Updated tax calculation - only calculate ITBIS for products that have tax enabled
  const cartTax = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    
    // Only calculate tax if the product has tax enabled (hasTax !== false)
    if (!product || !product.hasTax) {
      return sum; // No tax for this item
    }

    if (item.taxType === 'included') {
      return sum; // Tax already included in price
    } else if (item.taxType === 'exempt') {
      return sum + 0; // Exempt from tax
    } else {
      // Tax excluded - calculate and add
      return sum + (item.price * item.quantity * (item.taxRate / 100));
    }
  }, 0);
  
  const cartTotal = cartSubtotal + cartTax;

  const getProduct = (productId: string): Product | undefined => {
    return products.find(product => product.id === productId);
  };

  const getCustomer = (customerId: string): Customer | undefined => {
    return customers.find(customer => customer.id === customerId);
  };

  const addProduct = (product: Omit<Product, 'id'>): string => {
    const newProduct = { id: uuidv4(), ...product };
    setProducts(prev => [...prev, newProduct]);
    toast.success('Producto agregado exitosamente');
    return newProduct.id;
  };

  const updateProduct = (productId: string, updates: Partial<Product>): void => {
    setProducts(prev => prev.map(product => 
      product.id === productId ? { ...product, ...updates } : product
    ));
    toast.success('Producto actualizado exitosamente');
  };

  const deleteProduct = (productId: string): void => {
    setProducts(prev => prev.filter(product => product.id !== productId));
    toast.success('Producto eliminado exitosamente');
  };

  const createCustomer = (customer: Omit<Customer, 'id'>): void => {
    const newCustomer = { id: uuidv4(), ...customer };
    setCustomers(prev => [...prev, newCustomer]);
    toast.success('Cliente creado exitosamente');
  };

  const addCustomer = (customer: Omit<Customer, 'id'>): string => {
    const newCustomer = { id: uuidv4(), ...customer };
    setCustomers(prev => [...prev, newCustomer]);
    toast.success('Cliente creado exitosamente');
    return newCustomer.id;
  };

  const updateCustomer = (customerId: string, updates: Partial<Customer>): void => {
    setCustomers(prev => prev.map(customer => 
      customer.id === customerId ? { ...customer, ...updates } : customer
    ));
    toast.success('Cliente actualizado exitosamente');
  };

  const deleteCustomer = (customerId: string): void => {
    setCustomers(prev => prev.filter(customer => customer.id !== customerId));
    toast.success('Cliente eliminado exitosamente');
  };

  const addToCart = (productId: string, quantity: number = 1, forceWholesale?: boolean): void => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }

    // Enhanced stock validation - check current cart quantities
    const currentCartQuantity = cart
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    const totalRequestedQuantity = currentCartQuantity + quantity;
    
    if (totalRequestedQuantity > product.stock) {
      toast.error(`Stock insuficiente. Disponible: ${product.stock}, En carrito: ${currentCartQuantity}`);
      return;
    }

    const useWholesale = forceWholesale !== undefined ? forceWholesale : 
      selectedCustomer && selectedCustomer !== 'no-customer' && 
      customers.find(c => c.id === selectedCustomer)?.isWholesale;

    const price = useWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;

    setCart(prev => {
      const existingItemIndex = prev.findIndex(item => 
        item.productId === productId && item.isWholesalePrice === useWholesale
      );

      if (existingItemIndex >= 0) {
        const newCart = [...prev];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity
        };
        return newCart;
      } else {
        return [...prev, {
          productId,
          name: product.name,
          price,
          quantity,
          taxRate: product.taxRate,
          isWholesalePrice: useWholesale,
          taxType: product.taxType || 'included'
        }];
      }
    });

    setLastAddedProductId(productId);
    // Remove toast notification for product added
  };

  const processBarcodeCommand = (input: string): void => {
    console.log('Procesando comando de código de barras:', input);
    
    if (input.startsWith('+')) {
      const quantityStr = input.substring(1);
      const quantity = parseFloat(quantityStr);
      
      if (isNaN(quantity) || quantity <= 0) {
        toast.error('Cantidad inválida');
        return;
      }

      if (lastAddedProductId) {
        const product = products.find(p => p.id === lastAddedProductId);
        if (product) {
          const allowDecimal = product.allowDecimal || product.isFractional;
          const finalQuantity = allowDecimal ? quantity : Math.round(quantity);
          
          // Enhanced stock validation for quantity updates
          const currentCartItem = cart.find(item => item.productId === lastAddedProductId);
          if (currentCartItem && finalQuantity > product.stock) {
            toast.error(`Stock insuficiente. Disponible: ${product.stock}`);
            return;
          }
          
          updateCartQuantity(lastAddedProductId, finalQuantity);
          // Remove toast notification for quantity update
        } else {
          toast.error('Producto no encontrado');
        }
      } else {
        toast.info('Primero escanea un producto, luego usa +cantidad');
      }
      return;
    }

    const product = products.find(p => p.barcode === input);
    if (product) {
      if (product.stock > 0) {
        addToCart(product.id, 1);
        // Remove toast notification for product found and added
      } else {
        toast.error('Producto sin stock');
      }
    } else {
      toast.error('Código de barras no encontrado');
    }
  };

  const removeFromCart = (productId: string): void => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    if (lastAddedProductId === productId) {
      setLastAddedProductId(null);
    }
  };

  const updateCartQuantity = (productId: string, quantity: number): void => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = getProduct(productId);
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }

    // Enhanced stock validation for quantity updates
    if (quantity > product.stock) {
      toast.error(`Stock insuficiente. Disponible: ${product.stock}`);
      return;
    }

    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = (): void => {
    setCart([]);
    setLastAddedProductId(null);
  };

  const generateReceiptNumber = (): string => {
    const prefix = businessSettings?.receiptPrefix || 'REC';
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomNumber}`;
  };

  const recordInventoryMovement = (productId: string, type: 'sale' | 'purchase' | 'adjustment' | 'return', quantity: number, reason?: string): void => {
    const newInventoryMovement: InventoryMovement = {
      id: uuidv4(),
      productId,
      type,
      quantity,
      reason: reason || '',
      date: new Date().toISOString(),
      userId: currentUser?.id || 'system'
    };
    setInventoryMovements(prev => [...prev, newInventoryMovement]);
  };

  const completeSale = (saleData: any): Sale => {
    const newSale: Sale = { 
      id: uuidv4(), 
      date: new Date().toISOString(),
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      payments: [],
      customerId: 'no-customer',
      userId: currentUser?.id || 'system',
      receiptNumber: generateReceiptNumber(),
      status: 'completed',
      returnedItems: [],
      ...saleData 
    };
    setSales(prev => [...prev, newSale]);
    
    clearCart();
    
    return newSale;
  };

  const getCreditSales = (customerId: string): Sale[] => {
    return sales.filter(sale => 
      sale.customerId === customerId && 
      (sale.status === 'credit' || sale.status === 'paid-credit')
    );
  };

  const updateCreditSale = (saleId: string, paymentAmount: number, paymentMethod: PaymentMethod): void => {
    setSales(prev => prev.map(sale => {
      if (sale.id === saleId) {
        const newPayments = [...sale.payments, paymentMethod];
        const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
        const newStatus = totalPaid >= sale.total ? 'paid-credit' : 'credit';
        
        return {
          ...sale,
          payments: newPayments,
          status: newStatus
        };
      }
      return sale;
    }));

    const sale = sales.find(s => s.id === saleId);
    if (sale?.customerId) {
      setCustomers(prev => prev.map(customer => {
        if (customer.id === sale.customerId) {
          const newCreditBalance = (customer.creditBalance || 0) - paymentAmount;
          return {
            ...customer,
            creditBalance: Math.max(0, newCreditBalance)
          };
        }
        return customer;
      }));
    }

    toast.success('Pago aplicado exitosamente');
  };

  const processReturn = (saleId: string, returnItems: any[], reason?: string): string => {
    const returnId = uuidv4();
    const returnDate = new Date().toISOString();
    
    setSales(prev => prev.map(sale => {
      if (sale.id === saleId) {
        const returnedItems: ReturnedItem[] = returnItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.returnQuantity || item.quantity,
          returnReason: reason || item.reason || 'Devolución',
          returnDate,
          originalSaleId: saleId
        }));

        return {
          ...sale,
          status: 'returned',
          returnedItems: [...(sale.returnedItems || []), ...returnedItems]
        };
      }
      return sale;
    }));

    // Update inventory for returned items
    returnItems.forEach(item => {
      const quantity = item.returnQuantity || item.quantity;
      recordInventoryMovement(item.productId, 'return', quantity, reason || 'Devolución');
      
      // Restore stock
      setProducts(prev => prev.map(product => 
        product.id === item.productId 
          ? { ...product, stock: product.stock + quantity }
          : product
      ));
    });

    toast.success('Devolución procesada exitosamente');
    return returnId;
  };

  const createCreditNote = (creditNoteData: any): CreditNote => {
    const newCreditNote: CreditNote = {
      id: uuidv4(),
      ...creditNoteData,
      issueDate: new Date().toISOString(),
      status: 'active'
    };
    setCreditNotes(prev => [...prev, newCreditNote]);
    return newCreditNote;
  };

  const getCustomerCreditNotes = (customerId: string): CreditNote[] => {
    return creditNotes.filter(note => note.customerId === customerId && note.status === 'active');
  };

  const resumeHeldOrder = (orderId: string): void => {
    const order = heldOrders.find(o => o.id === orderId);
    if (order) {
      setCart(order.items);
      setHeldOrders(prev => prev.filter(o => o.id !== orderId));
      toast.success('Orden recuperada');
    }
  };

  const searchHeldOrders = (searchTerm: string): HeldOrder[] => {
    return heldOrders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.note?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const deleteHeldOrder = (orderId: string): void => {
    setHeldOrders(prev => prev.filter(order => order.id !== orderId));
    toast.success('Pedido eliminado');
  };

  const holdCurrentOrder = (note?: string): void => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    const heldOrder: HeldOrder = {
      id: `HOLD-${Date.now()}`,
      items: [...cart],
      customerId: selectedCustomer !== 'no-customer' ? selectedCustomer : undefined,
      total: cartTotal,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Sistema',
      note: note || undefined
    };

    setHeldOrders(prev => [...prev, heldOrder]);
    clearCart();
    toast.success('Pedido guardado');
  };

  const addCashClosure = (closureData: any): void => {
    console.log('Cerrando caja:', closureData);
    toast.success('Cierre de caja completado');
  };

  const validateAccessKey = (action: string, key: string): boolean => {
    const accessKeys = businessSettings?.accessKeys || {};
    const requiredKey = accessKeys[action];
    
    if (!requiredKey) {
      return true; // No key required for this action
    }
    
    return key === requiredKey;
  };

  const addSupplier = (supplier: any): string => {
    const newSupplier = { id: uuidv4(), ...supplier };
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier.id;
  };

  const updateSupplier = (supplierId: string, updates: any): void => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId ? { ...supplier, ...updates } : supplier
    ));
  };

  const addPurchase = (purchase: any): string => {
    const newPurchase = { id: uuidv4(), ...purchase };
    setPurchases(prev => [...prev, newPurchase]);
    return newPurchase.id;
  };

  const updatePurchase = (purchaseId: string, updates: any): void => {
    setPurchases(prev => prev.map(purchase => 
      purchase.id === purchaseId ? { ...purchase, ...updates } : purchase
    ));
  };

  const addInventoryCount = (count: any): string => {
    const newCount = { id: uuidv4(), ...count };
    setInventoryCounts(prev => [...prev, newCount]);
    return newCount.id;
  };

  const updateInventoryCount = (countId: string, updates: any): void => {
    setInventoryCounts(prev => prev.map(count => 
      count.id === countId ? { ...count, ...updates } : count
    ));
  };

  const value: PosContextType = {
    // Products
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,

    // Customers
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    createCustomer,
    getCustomer,

    // Cart
    cart,
    cartSubtotal,
    cartTax,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,

    // Sales
    sales,
    completeSale,
    getCreditSales,
    updateCreditSale,
    processReturn,

    // Credit Notes
    creditNotes,
    createCreditNote,
    getCustomerCreditNotes,

    // Inventory
    inventoryMovements,
    recordInventoryMovement,

    // Users
    users,
    currentUser,

    // Shifts
    shifts,
    cashSessions,
    currentShift,
    setCurrentShift,
    addCashClosure,

    // Held orders
    heldOrders,
    resumeHeldOrder,
    searchHeldOrders,
    deleteHeldOrder,
    holdCurrentOrder,

    // Customer selection
    selectedCustomer,
    setSelectedCustomer,

    // Last added product
    lastAddedProductId,
    setLastAddedProductId,
    processBarcodeCommand,

    // Access validation
    validateAccessKey,

    // Suppliers and purchases
    suppliers,
    addSupplier,
    updateSupplier,
    purchases,
    addPurchase,
    updatePurchase,

    // Inventory counts
    inventoryCounts,
    addInventoryCount,
    updateInventoryCount,
  };

  return (
    <PosContext.Provider value={value}>
      {children}
    </PosContext.Provider>
  );
};

export const usePos = (): PosContextType => {
  const context = useContext(PosContext);
  if (context === undefined) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};

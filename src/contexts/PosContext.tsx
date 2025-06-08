import React, { createContext, useState, useContext, useEffect } from 'react';
import { Product, CartItem, Customer, PaymentMethod, Sale, ReturnedItem, CreditNote, User, InventoryMovement, Shift, CashSession, CashCount, HeldOrder, InvoiceData, CashSessionSummary } from '@/types/pos';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

interface PosContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (productId: string, quantity?: number, forceWholesale?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  getProduct: (productId: string) => Product | undefined;
  getCustomer: (customerId: string) => Customer | undefined;
  addCustomer: (customer: Omit<Customer, 'id'>) => string;
  createCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  deleteCustomer: (customerId: string) => void;
  processPayment: (paymentMethods: PaymentMethod[], customerId?: string, returnAmount?: number, returnId?: string) => Promise<Sale | CreditNote | undefined>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  getSale: (saleId: string) => Sale | undefined;
  recordReturn: (saleId: string, returnedItems: ReturnedItem[], returnReason: string, paymentMethod: PaymentMethod) => Promise<Sale | undefined>;
  creditNotes: CreditNote[];
  setCreditNotes: React.Dispatch<React.SetStateAction<CreditNote[]>>;
  getCreditNote: (creditNoteId: string) => CreditNote | undefined;
  applyCreditNote: (creditNoteId: string, saleId: string, paymentMethod: PaymentMethod) => Promise<CreditNote | undefined>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  inventoryMovements: InventoryMovement[];
  setInventoryMovements: React.Dispatch<React.SetStateAction<InventoryMovement[]>>;
  recordInventoryMovement: (productId: string, type: 'sale' | 'purchase' | 'adjustment' | 'return', quantity: number, reason?: string) => void;
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  createShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (shiftId: string, updates: Partial<Shift>) => void;
  deleteShift: (shiftId: string) => void;
  cashSessions: CashSession[];
  setCashSessions: React.Dispatch<React.SetStateAction<CashSession[]>>;
  currentShift: CashSession | null;
  setCurrentShift: React.Dispatch<React.SetStateAction<CashSession | null>>;
  startCashSession: (shiftId: string, openingAmount: number) => void;
  closeCashSession: (cashSessionId: string, closingAmount: number, cashCount: CashCount) => void;
  heldOrders: HeldOrder[];
  setHeldOrders: React.Dispatch<React.SetStateAction<HeldOrder[]>>;
  holdCurrentOrder: (note?: string) => void;
  retrieveHeldOrder: (orderId: string) => void;
  resumeHeldOrder: (orderId: string) => void;
  deleteHeldOrder: (orderId: string) => void;
  searchHeldOrders: (searchTerm: string) => HeldOrder[];
  generateInvoiceData: (saleId: string, type?: 'sale' | 'credit-note' | 'return', returnData?: { returnAmount: number; returnId: string; returnItems?: any[]; returnReason?: string; }) => InvoiceData | undefined;
  cashSessionSummary: (cashSessionId: string) => CashSessionSummary;
  addCashClosure: (closureData: any) => void;
  validateAccessKey: (action: string, key: string) => boolean;
  selectedCustomer: string | null;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<string | null>>;
  lastAddedProductId: string | null;
  setLastAddedProductId: React.Dispatch<React.SetStateAction<string | null>>;
  processBarcodeCommand: (input: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => string;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  suppliers: any[];
  purchases: any[];
  inventoryCounts: any[];
  addInventoryCount: (count: any) => string;
  updateInventoryCount: (countId: string, updates: any) => void;
  addSupplier: (supplier: any) => string;
  updateSupplier: (supplierId: string, updates: any) => void;
  addPurchase: (purchase: any) => string;
  updatePurchase: (purchaseId: string, updates: any) => void;
  getCreditSales: (customerId: string) => Sale[];
  processReturn: (saleId: string, returnItems: ReturnedItem[]) => string;
  createCreditNote: (creditNote: Omit<CreditNote, 'id'>) => string;
  getCustomerCreditNotes: (customerId: string) => CreditNote[];
  updateCreditSale: (saleId: string, updates: Partial<Sale>) => void;
  completeSale: (saleData: any) => Promise<Sale>;
  currentUser: any;
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
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>('no-customer');
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [inventoryCounts, setInventoryCounts] = useState<any[]>([]);
  const { currentUser } = useAuth();
  const { businessSettings } = useSettings();

  // Calculate cart subtotal, tax, and total
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = cart.reduce((sum, item) => {
    if (item.taxType === 'included') {
      return sum;
    } else if (item.taxType === 'exempt') {
      return sum + 0;
    } else {
      return sum + (item.price * item.quantity * (item.taxRate / 100));
    }
  }, 0);
  const cartTotal = cartSubtotal + cartTax;

  // Helper function to get a product by ID
  const getProduct = (productId: string): Product | undefined => {
    return products.find(product => product.id === productId);
  };

  // Helper function to get a customer by ID
  const getCustomer = (customerId: string): Customer | undefined => {
    return customers.find(customer => customer.id === customerId);
  };

  // Function to add a product
  const addProduct = (product: Omit<Product, 'id'>): string => {
    const newProduct: Product = { id: uuidv4(), ...product };
    setProducts(prev => [...prev, newProduct]);
    toast.success('Producto agregado exitosamente');
    return newProduct.id;
  };

  // Function to update a product
  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId ? { ...product, ...updates } : product
      )
    );
    toast.success('Producto actualizado exitosamente');
  };

  // Function to delete a product
  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
    toast.success('Producto eliminado exitosamente');
  };

  // Function to create a new customer
  const createCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = { id: uuidv4(), ...customer };
    setCustomers(prev => [...prev, newCustomer]);
    toast.success('Cliente creado exitosamente');
  };

  // Function to add a customer (alias for createCustomer)
  const addCustomer = (customer: Omit<Customer, 'id'>): string => {
    const newCustomer: Customer = { id: uuidv4(), ...customer };
    setCustomers(prev => [...prev, newCustomer]);
    toast.success('Cliente creado exitosamente');
    return newCustomer.id;
  };

  // Function to update an existing customer
  const updateCustomer = (customerId: string, updates: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(customer =>
        customer.id === customerId ? { ...customer, ...updates } : customer
      )
    );
    toast.success('Cliente actualizado exitosamente');
  };

  // Function to delete a customer
  const deleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== customerId));
    toast.success('Cliente eliminado exitosamente');
  };

  const addToCart = (productId: string, quantity: number = 1, forceWholesale?: boolean) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }

    if (product.stock < quantity) {
      toast.error('Stock insuficiente');
      return;
    }

    const useWholesale = forceWholesale !== undefined ? forceWholesale : 
      (selectedCustomer && selectedCustomer !== 'no-customer' && 
       customers.find(c => c.id === selectedCustomer)?.isWholesale);

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

    // Guardar el ID del último producto agregado
    setLastAddedProductId(productId);
    
    // Actualizar stock
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, stock: p.stock - quantity } : p
    ));
  };

  const processBarcodeCommand = (input: string) => {
    console.log('Procesando comando de código de barras:', input);
    
    // Comando de cantidad (+cantidad)
    if (input.startsWith('+')) {
      const quantityStr = input.substring(1);
      const quantity = parseFloat(quantityStr);
      
      if (isNaN(quantity) || quantity <= 0) {
        toast.error('Cantidad inválida');
        return;
      }

      // Aplicar la cantidad al último producto agregado
      if (lastAddedProductId) {
        const product = products.find(p => p.id === lastAddedProductId);
        if (product) {
          // Verificar si el producto permite decimales
          const allowDecimal = product.allowDecimal || product.isFractional;
          const finalQuantity = allowDecimal ? quantity : Math.round(quantity);
          
          // Actualizar la cantidad del último producto en el carrito
          updateCartQuantity(lastAddedProductId, finalQuantity);
          toast.success(`Cantidad actualizada: ${finalQuantity} ${product.fractionalUnit || 'unidades'} de ${product.name}`);
        } else {
          toast.error('Producto no encontrado');
        }
      } else {
        toast.info('Primero escanea un producto, luego usa +cantidad');
      }
      return;
    }

    // Buscar producto por código de barras
    const product = products.find(p => p.barcode === input);
    if (product) {
      if (product.stock > 0) {
        addToCart(product.id, 1);
        toast.success(`${product.name} agregado al carrito`);
      } else {
        toast.error('Producto sin stock');
      }
    } else {
      toast.error('Código de barras no encontrado');
    }
  };

  // Function to remove a product from the cart
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    // Reset last added product id if the removed item was the last one
    if (lastAddedProductId === productId) {
      setLastAddedProductId(null);
    }
  };

  // Function to update the quantity of a product in the cart
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = getProduct(productId);
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }

    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          return { ...item, quantity: quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
    setLastAddedProductId(null);
  };

  // Function to process a payment
  const processPayment = async (paymentMethods: PaymentMethod[], customerId?: string, returnAmount?: number, returnId?: string): Promise<Sale | CreditNote | undefined> => {
    const saleId = uuidv4();
    const receiptNumber = generateReceiptNumber();
    const userId = currentUser?.id || 'system';
    const saleDate = new Date().toISOString();

    // Validate payment amounts
    const totalPaid = paymentMethods.reduce((sum, payment) => sum + payment.amount, 0);
    const amountDue = returnAmount !== undefined ? returnAmount : cartTotal;
    if (totalPaid < amountDue) {
      toast.error('Monto pagado es menor que el total a pagar.');
      return;
    }

    // Handle returns
    if (returnAmount !== undefined && returnId) {
      // Create a credit note for the return
      const creditNoteId = uuidv4();
      const returnItems = sales.find(s => s.id === returnId)?.items || [];

      const newCreditNote: CreditNote = {
        id: creditNoteId,
        customerId: customerId || 'no-customer',
        originalSaleId: returnId,
        amount: returnAmount,
        balance: returnAmount,
        issueDate: saleDate,
        reason: 'Devolución de venta',
        status: 'active',
        returnItems: returnItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          returnReason: 'Devolución',
          returnDate: saleDate,
          originalSaleId: returnId
        }))
      };

      setCreditNotes(prev => [...prev, newCreditNote]);
      setSales(prevSales => {
        return prevSales.map(sale => {
          if (sale.id === returnId) {
            return {
              ...sale,
              status: 'returned',
              returnedItems: returnItems.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                returnReason: 'Devolución',
                returnDate: saleDate,
                originalSaleId: returnId
              }))
            };
          }
          return sale;
        });
      });

      // Record inventory movements for returned items
      returnItems.forEach(item => {
        recordInventoryMovement(item.productId, 'return', item.quantity, 'Devolución de venta');
      });

      // Clear the cart and reset the last added product ID
      clearCart();

      toast.success('Devolución procesada y nota de crédito generada.');
      return newCreditNote;
    }

    // Create a new sale
    const newSale: Sale = {
      id: saleId,
      date: saleDate,
      items: cart.map(item => ({ ...item })),
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      payments: paymentMethods.map(payment => ({ ...payment })),
      customerId: customerId || 'no-customer',
      userId: userId,
      receiptNumber: receiptNumber,
      status: 'completed',
      returnedItems: [],
      dueDate: undefined
    };

    setSales(prev => [...prev, newSale]);

    // Record inventory movements for sold items
    cart.forEach(item => {
      recordInventoryMovement(item.productId, 'sale', item.quantity, 'Venta');
    });

    // Clear the cart and reset the last added product ID
    clearCart();

    toast.success('Venta procesada exitosamente');
    return newSale;
  };

  // Function to generate a unique receipt number
  const generateReceiptNumber = (): string => {
    const prefix = businessSettings?.receiptPrefix || 'REC';
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    return `${prefix}-${randomNumber}`;
  };

  // Function to record a return
  const recordReturn = async (saleId: string, returnedItems: ReturnedItem[], returnReason: string, paymentMethod: PaymentMethod): Promise<Sale | undefined> => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) {
      toast.error('Venta no encontrada');
      return;
    }

    // Validate return amounts
    const totalReturned = returnedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalReturned > sale.total) {
      toast.error('Monto de devolución es mayor que el total de la venta.');
      return;
    }

    // Update the sale with returned items
    const updatedSale: Sale = {
      ...sale,
      status: 'returned',
      returnedItems: returnedItems.map(item => ({ ...item, returnReason, returnDate: new Date().toISOString() }))
    };

    setSales(prev => prev.map(s => s.id === saleId ? updatedSale : s));

    // Record inventory movements for returned items
    returnedItems.forEach(item => {
      recordInventoryMovement(item.productId, 'return', item.quantity, returnReason);
    });

    toast.success('Devolución registrada exitosamente');
    return updatedSale;
  };

  // Function to get a sale by ID
  const getSale = (saleId: string): Sale | undefined => {
    return sales.find(sale => sale.id === saleId);
  };

  // Function to get a credit note by ID
  const getCreditNote = (creditNoteId: string): CreditNote | undefined => {
    return creditNotes.find(creditNote => creditNote.id === creditNoteId);
  };

  // Function to apply a credit note to a sale
  const applyCreditNote = async (creditNoteId: string, saleId: string, paymentMethod: PaymentMethod): Promise<CreditNote | undefined> => {
    const creditNote = creditNotes.find(cn => cn.id === creditNoteId);
    if (!creditNote) {
      toast.error('Nota de crédito no encontrada');
      return;
    }

    if (creditNote.status !== 'active') {
      toast.error('Nota de crédito no está activa');
      return;
    }

    if (creditNote.balance <= 0) {
      toast.error('Nota de crédito no tiene saldo disponible');
      return;
    }

    const sale = sales.find(s => s.id === saleId);
    if (!sale) {
      toast.error('Venta no encontrada');
      return;
    }

    // Validate payment amounts
    if (paymentMethod.amount > creditNote.balance) {
      toast.error('Monto a pagar con nota de crédito es mayor que el saldo disponible.');
      return;
    }

    // Update the credit note
    const updatedCreditNote: CreditNote = {
      ...creditNote,
      balance: creditNote.balance - paymentMethod.amount,
      status: creditNote.balance - paymentMethod.amount === 0 ? 'used' : 'active'
    };

    setCreditNotes(prev => prev.map(cn => cn.id === creditNoteId ? updatedCreditNote : cn));

    // Update the sale with the credit note payment
    const updatedSale: Sale = {
      ...sale,
      payments: [...sale.payments, { ...paymentMethod, creditNoteId: creditNoteId }]
    };

    setSales(prev => prev.map(s => s.id === saleId ? updatedSale : s));

    toast.success('Nota de crédito aplicada exitosamente');
    return updatedCreditNote;
  };

  // Function to record an inventory movement
  const recordInventoryMovement = (productId: string, type: 'sale' | 'purchase' | 'adjustment' | 'return', quantity: number, reason?: string) => {
    const newInventoryMovement: InventoryMovement = {
      id: uuidv4(),
      productId,
      type,
      quantity,
      reason,
      date: new Date().toISOString(),
      userId: currentUser?.id || 'system'
    };

    setInventoryMovements(prev => [...prev, newInventoryMovement]);

    // Update product stock
    setProducts(prev => {
      return prev.map(product => {
        if (product.id === productId) {
          let newStock = product.stock;
          if (type === 'sale') {
            newStock -= quantity;
          } else if (type === 'purchase') {
            newStock += quantity;
          } else if (type === 'return') {
            newStock += quantity;
          } else if (type === 'adjustment') {
            newStock += quantity;
          }
          return { ...product, stock: newStock };
        }
        return product;
      });
    });
  };

  // Function to create a new shift
  const createShift = (shift: Omit<Shift, 'id'>) => {
    const newShift: Shift = { id: uuidv4(), ...shift };
    setShifts(prev => [...prev, newShift]);
    toast.success('Turno creado exitosamente');
  };

  // Function to update an existing shift
  const updateShift = (shiftId: string, updates: Partial<Shift>) => {
    setShifts(prev =>
      prev.map(shift =>
        shift.id === shiftId ? { ...shift, ...updates } : shift
      )
    );
    toast.success('Turno actualizado exitosamente');
  };

  // Function to delete a shift
  const deleteShift = (shiftId: string) => {
    setShifts(prev => prev.filter(shift => shift.id !== shiftId));
    toast.success('Turno eliminado exitosamente');
  };

  // Function to start a cash session
  const startCashSession = (shiftId: string, openingAmount: number) => {
    const newCashSession: CashSession = {
      id: uuidv4(),
      userId: currentUser?.id || 'system',
      shiftId: shiftId,
      openingAmount: openingAmount,
      openingTime: new Date().toISOString(),
      closingAmount: undefined,
      closingTime: undefined,
      status: 'open',
      sales: [],
      totalSales: 0,
      totalCash: 0,
      totalCard: 0,
      totalTransfer: 0,
      totalCredit: 0
    };
    setCashSessions(prev => [...prev, newCashSession]);
    setCurrentShift(newCashSession);
    toast.success('Sesión de caja iniciada exitosamente');
  };

  // Function to close a cash session
  const closeCashSession = (cashSessionId: string, closingAmount: number, cashCount: CashCount) => {
    const cashSession = cashSessions.find(cs => cs.id === cashSessionId);
    if (!cashSession) {
      toast.error('Sesión de caja no encontrada');
      return;
    }

    const updatedCashSession: CashSession = {
      ...cashSession,
      closingAmount: closingAmount,
      closingTime: new Date().toISOString(),
      status: 'closed',
      actualCash: cashCount.cash,
      actualCard: cashCount.card,
      actualTransfer: cashCount.transfer,
      cashDifference: cashCount.cash - cashSession.totalCash - cashSession.openingAmount,
      cardDifference: cashCount.card - cashSession.totalCard,
      transferDifference: cashCount.transfer - cashSession.totalTransfer
    };

    setCashSessions(prev => prev.map(cs => cs.id === cashSessionId ? updatedCashSession : cs));
    setCurrentShift(null);
    toast.success('Sesión de caja cerrada exitosamente');
  };

  // Function to hold the current order
  const holdCurrentOrder = (note?: string) => {
    if (cart.length === 0) {
      toast.error('No hay productos en el carrito para dejar abierto.');
      return;
    }

    const newHeldOrder: HeldOrder = {
      id: uuidv4(),
      items: cart.map(item => ({ ...item })),
      customerId: selectedCustomer || undefined,
      total: cartTotal,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'system',
      note: note
    };

    setHeldOrders(prev => [...prev, newHeldOrder]);
    clearCart();
    toast.success('Pedido dejado abierto exitosamente');
  };

  // Function to retrieve a held order
  const retrieveHeldOrder = (orderId: string) => {
    const heldOrder = heldOrders.find(order => order.id === orderId);
    if (!heldOrder) {
      toast.error('Pedido no encontrado');
      return;
    }

    setCart(heldOrder.items.map(item => ({ ...item })));
    setSelectedCustomer(heldOrder.customerId || 'no-customer');
    setHeldOrders(prev => prev.filter(order => order.id !== orderId));
    toast.success('Pedido recuperado exitosamente');
  };

  // Function to resume a held order (alias for retrieveHeldOrder)
  const resumeHeldOrder = (orderId: string) => {
    retrieveHeldOrder(orderId);
  };

  // Function to delete a held order
  const deleteHeldOrder = (orderId: string) => {
    setHeldOrders(prev => prev.filter(order => order.id !== orderId));
    toast.success('Pedido eliminado exitosamente');
  };

  // Function to search held orders
  const searchHeldOrders = (searchTerm: string): HeldOrder[] => {
    if (!searchTerm.trim()) return heldOrders;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return heldOrders.filter(order => 
      order.id.toLowerCase().includes(lowercaseSearch) ||
      order.note?.toLowerCase().includes(lowercaseSearch) ||
      order.createdBy.toLowerCase().includes(lowercaseSearch)
    );
  };

  // Function to generate invoice data
  const generateInvoiceData = (saleId: string, type: 'sale' | 'credit-note' | 'return' = 'sale', returnData?: { returnAmount: number; returnId: string; returnItems?: any[]; returnReason?: string; }): InvoiceData | undefined => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) {
      toast.error('Venta no encontrada');
      return;
    }

    const customer = customers.find(c => c.id === sale.customerId);

    return {
      type: type,
      sale: sale,
      customer: customer,
      returnData: returnData
    };
  };

  // Function to calculate cash session summary
  const cashSessionSummary = (cashSessionId: string): CashSessionSummary => {
    const cashSession = cashSessions.find(cs => cs.id === cashSessionId);
    if (!cashSession) {
      toast.error('Sesión de caja no encontrada');
      return {
        totalSales: 0,
        totalCash: 0,
        totalCard: 0,
        totalTransfer: 0,
        totalCredit: 0,
        openingAmount: 0,
        netCashSales: 0,
        actualAmounts: {
          cash: 0,
          card: 0,
          transfer: 0
        },
        differences: {
          cash: 0,
          card: 0,
          transfer: 0,
          total: 0
        }
      };
    }

    const totalSales = cashSession.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCash = cashSession.sales.reduce((sum, sale) => {
      const cashPayment = sale.payments.find(payment => payment.type === 'cash');
      return sum + (cashPayment ? cashPayment.amount : 0);
    }, 0);
    const totalCard = cashSession.sales.reduce((sum, sale) => {
      const cardPayment = sale.payments.find(payment => payment.type === 'card');
      return sum + (cardPayment ? cardPayment.amount : 0);
    }, 0);
    const totalTransfer = cashSession.sales.reduce((sum, sale) => {
      const transferPayment = sale.payments.find(payment => payment.type === 'transfer');
      return sum + (transferPayment ? transferPayment.amount : 0);
    }, 0);
    const totalCredit = cashSession.sales.reduce((sum, sale) => {
      const creditPayment = sale.payments.find(payment => payment.type === 'credit');
      return sum + (creditPayment ? creditPayment.amount : 0);
    }, 0);
    const netCashSales = totalCash - cashSession.openingAmount;

    return {
      totalSales,
      totalCash,
      totalCard,
      totalTransfer,
      totalCredit,
      openingAmount: cashSession.openingAmount,
      netCashSales,
      actualAmounts: {
        cash: cashSession.actualCash || 0,
        card: cashSession.actualCard || 0,
        transfer: cashSession.actualTransfer || 0
      },
      differences: {
        cash: (cashSession.actualCash || 0) - totalCash - cashSession.openingAmount,
        card: (cashSession.actualCard || 0) - totalCard,
        transfer: (cashSession.actualTransfer || 0) - totalTransfer,
        total: ((cashSession.actualCash || 0) - totalCash - cashSession.openingAmount) + ((cashSession.actualCard || 0) - totalCard) + ((cashSession.actualTransfer || 0) - totalTransfer)
      }
    };
  };

  const addCashClosure = (closureData: any) => {
    console.log('Cuadre de caja completado:', closureData);
    // Here you would typically save the closure data and close the shift
    setCurrentShift(null);
  };

  const validateAccessKey = (action: string, key: string): boolean => {
    const validKey = businessSettings?.accessKeys?.[action];
    return key === validKey;
  };

  // Additional helper functions
  const addInventoryCount = (count: any): string => {
    const newCount = { id: uuidv4(), ...count };
    setInventoryCounts(prev => [...prev, newCount]);
    return newCount.id;
  };

  const updateInventoryCount = (countId: string, updates: any) => {
    setInventoryCounts(prev => prev.map(count => 
      count.id === countId ? { ...count, ...updates } : count
    ));
  };

  const addSupplier = (supplier: any): string => {
    const newSupplier = { id: uuidv4(), ...supplier };
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier.id;
  };

  const updateSupplier = (supplierId: string, updates: any) => {
    setSuppliers(prev => prev.map(supplier =>
      supplier.id === supplierId ? { ...supplier, ...updates } : supplier
    ));
  };

  const addPurchase = (purchase: any): string => {
    const newPurchase = { id: uuidv4(), ...purchase };
    setPurchases(prev => [...prev, newPurchase]);
    return newPurchase.id;
  };

  const updatePurchase = (purchaseId: string, updates: any) => {
    setPurchases(prev => prev.map(purchase =>
      purchase.id === purchaseId ? { ...purchase, ...updates } : purchase
    ));
  };

  const getCreditSales = (customerId: string): Sale[] => {
    return sales.filter(sale => 
      sale.customerId === customerId && 
      sale.payments.some(payment => payment.type === 'credit')
    );
  };

  const processReturn = (saleId: string, returnItems: ReturnedItem[]): string => {
    const returnId = uuidv4();
    // Process return logic here
    return returnId;
  };

  const createCreditNote = (creditNote: Omit<CreditNote, 'id'>): string => {
    const newCreditNote: CreditNote = { id: uuidv4(), ...creditNote };
    setCreditNotes(prev => [...prev, newCreditNote]);
    return newCreditNote.id;
  };

  const getCustomerCreditNotes = (customerId: string): CreditNote[] => {
    return creditNotes.filter(note => note.customerId === customerId);
  };

  const updateCreditSale = (saleId: string, updates: Partial<Sale>) => {
    setSales(prev => prev.map(sale =>
      sale.id === saleId ? { ...sale, ...updates } : sale
    ));
  };

  const completeSale = async (saleData: any): Promise<Sale> => {
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
    return newSale;
  };

  const value = {
    products,
    setProducts,
    customers,
    setCustomers,
    cart,
    setCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartTax,
    cartTotal,
    getProduct,
    getCustomer,
    addCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    processPayment,
    sales,
    setSales,
    getSale,
    recordReturn,
    creditNotes,
    setCreditNotes,
    getCreditNote,
    applyCreditNote,
    users,
    setUsers,
    inventoryMovements,
    setInventoryMovements,
    recordInventoryMovement,
    shifts,
    setShifts,
    createShift,
    updateShift,
    deleteShift,
    cashSessions,
    setCashSessions,
    currentShift,
    setCurrentShift,
    startCashSession,
    closeCashSession,
    heldOrders,
    setHeldOrders,
    holdCurrentOrder,
    retrieveHeldOrder,
    resumeHeldOrder,
    deleteHeldOrder,
    searchHeldOrders,
    generateInvoiceData,
    cashSessionSummary,
    addCashClosure,
    validateAccessKey,
    selectedCustomer,
    setSelectedCustomer,
    lastAddedProductId,
    setLastAddedProductId,
    processBarcodeCommand,
    addProduct,
    updateProduct,
    deleteProduct,
    suppliers,
    purchases,
    inventoryCounts,
    addInventoryCount,
    updateInventoryCount,
    addSupplier,
    updateSupplier,
    addPurchase,
    updatePurchase,
    getCreditSales,
    processReturn,
    createCreditNote,
    getCustomerCreditNotes,
    updateCreditSale,
    completeSale,
    currentUser,
  };

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};

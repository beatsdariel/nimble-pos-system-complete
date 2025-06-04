
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Product, Customer, CartItem, Sale, ReturnedItem, PaymentMethod } from '@/types/pos';
import { User } from '@/types/auth';

interface PosContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  getCustomer: (id: string) => Customer | undefined;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, isWholesale?: boolean) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartSubtotal: number;
  cartTax: number;
  
  // Sales
  sales: Sale[];
  completeSale: (sale: Omit<Sale, 'id'>) => void;
  getSale: (id: string) => Sale | undefined;
  
  // Returns
  processReturn: (saleId: string, items: ReturnedItem[]) => string;
  returnedItems: ReturnedItem[];
  
  // Credit
  getCustomerCreditBalance: (customerId: string) => number;
  getCreditSales: (customerId: string) => Sale[];
  updateCreditSale: (saleId: string, paymentAmount: number, paymentMethod: PaymentMethod) => void;
  
  // User
  currentUser: User | null;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, addCashEntry } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [returnedItems, setReturnedItems] = useState<ReturnedItem[]>([]);

  // Initialize with sample data
  useEffect(() => {
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Café Premium',
        description: 'Café de alta calidad origen dominicano',
        barcode: '7501234567890',
        sku: 'CAFE-001',
        price: 350.00,
        wholesalePrice: 300.00,
        cost: 200.00,
        stock: 25,
        minStock: 5,
        category: 'Bebidas',
        taxRate: 0.18,
        image: '/placeholder.svg'
      },
      {
        id: '2',
        name: 'Agua Mineral 500ml',
        description: 'Agua mineral natural',
        barcode: '7501234567891',
        sku: 'AGUA-001',
        price: 25.00,
        wholesalePrice: 20.00,
        cost: 15.00,
        stock: 100,
        minStock: 20,
        category: 'Bebidas',
        taxRate: 0.18,
        image: '/placeholder.svg'
      },
      {
        id: '3',
        name: 'Pan Tostado',
        description: 'Pan tostado integral',
        barcode: '7501234567892',
        sku: 'PAN-001',
        price: 85.00,
        wholesalePrice: 70.00,
        cost: 50.00,
        stock: 15,
        minStock: 10,
        category: 'Panadería',
        taxRate: 0.18,
        image: '/placeholder.svg'
      },
      {
        id: '4',
        name: 'Refresco Cola 355ml',
        description: 'Bebida carbonatada sabor cola',
        barcode: '7501234567893',
        sku: 'REF-001',
        price: 45.00,
        wholesalePrice: 38.00,
        cost: 25.00,
        stock: 50,
        minStock: 15,
        category: 'Bebidas',
        taxRate: 0.18,
        image: '/placeholder.svg'
      },
      {
        id: '5',
        name: 'Galletas de Chocolate',
        description: 'Paquete de galletas con chips de chocolate',
        barcode: '7501234567894',
        sku: 'GAL-001',
        price: 120.00,
        wholesalePrice: 105.00,
        cost: 80.00,
        stock: 30,
        minStock: 8,
        category: 'Snacks',
        taxRate: 0.18,
        image: '/placeholder.svg'
      }
    ];
    setProducts(sampleProducts);

    const sampleCustomers: Customer[] = [
      {
        id: '1',
        name: 'Juan Pérez',
        email: 'juan@email.com',
        phone: '809-555-1234',
        document: '001-1234567-8',
        address: 'Calle Principal 123, Santo Domingo',
        creditLimit: 5000,
        creditBalance: 0,
        isWholesale: true
      },
      {
        id: '2',
        name: 'María García',
        email: 'maria@email.com',
        phone: '809-555-5678',
        document: '001-2345678-9',
        address: 'Av. Winston Churchill 456, Santo Domingo',
        creditLimit: 10000,
        creditBalance: 0,
        isWholesale: false
      }
    ];
    setCustomers(sampleCustomers);
  }, []);

  // Product functions
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProduct = (id: string) => {
    return products.find(p => p.id === id);
  };

  // Customer functions
  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = { 
      ...customer, 
      id: Date.now().toString(),
      creditBalance: 0,
      creditLimit: customer.creditLimit || 0 
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const getCustomer = (id: string) => {
    return customers.find(c => c.id === id);
  };

  // Cart functions
  const addToCart = (product: Product, quantity: number, isWholesale: boolean = false) => {
    setCart(prev => {
      const price = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;
      
      const existingItem = prev.find(item => 
        item.productId === product.id && item.isWholesalePrice === isWholesale
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id && item.isWholesalePrice === isWholesale
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, {
        productId: product.id,
        name: product.name,
        price,
        quantity,
        taxRate: product.taxRate,
        isWholesalePrice: isWholesale
      }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate cart totals
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = cart.reduce((sum, item) => sum + (item.price * item.quantity * item.taxRate), 0);
  const cartTotal = cartSubtotal + cartTax;

  // Get specific sale
  const getSale = (id: string) => {
    return sales.find(s => s.id === id);
  };

  // Credit functions
  const getCustomerCreditBalance = (customerId: string) => {
    const customer = getCustomer(customerId);
    return customer?.creditBalance || 0;
  };

  const getCreditSales = (customerId: string) => {
    return sales.filter(s => s.customerId === customerId && s.status === 'credit');
  };

  const updateCreditSale = (saleId: string, paymentAmount: number, paymentMethod: PaymentMethod) => {
    setSales(prev => {
      return prev.map(sale => {
        if (sale.id === saleId) {
          const updatedPayments = [...sale.payments, paymentMethod];
          const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
          const newStatus = totalPaid >= sale.total ? 'paid-credit' : 'credit';
          
          // Update customer credit balance
          if (sale.customerId && newStatus === 'paid-credit') {
            const customer = getCustomer(sale.customerId);
            if (customer) {
              updateCustomer(customer.id, {
                creditBalance: (customer.creditBalance || 0) - sale.total
              });
            }
          }
          
          return {
            ...sale,
            payments: updatedPayments,
            status: newStatus
          };
        }
        return sale;
      });
    });

    // Register cash entry if payment was cash
    if (paymentMethod.type === 'cash' && currentUser) {
      addCashEntry({
        type: 'credit-payment',
        amount: paymentAmount,
        description: `Pago de crédito ${saleId}`,
        userId: currentUser.id
      });
    }
  };

  // Return functions
  const processReturn = (saleId: string, items: ReturnedItem[]) => {
    if (!currentUser) return "";
    
    // Find original sale
    const originalSale = getSale(saleId);
    if (!originalSale) return "";

    // Create return ID
    const returnId = `RET-${Date.now()}`;
    
    // Calculate total return amount
    const returnTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Set the returnItems for reference
    setReturnedItems([...returnedItems, ...items]);
    
    // Update the original sale status
    setSales(prev => prev.map(sale => {
      if (sale.id === saleId) {
        const allItemsReturned = sale.items.every(item => {
          const returnedItem = items.find(ri => ri.productId === item.productId);
          return returnedItem && returnedItem.quantity >= item.quantity;
        });
        
        return {
          ...sale,
          status: allItemsReturned ? 'returned' : 'partially-returned',
          returnedItems: [...(sale.returnedItems || []), ...items]
        };
      }
      return sale;
    }));
    
    // Update product stock
    items.forEach(item => {
      updateProduct(item.productId, {
        stock: (getProduct(item.productId)?.stock || 0) + item.quantity
      });
    });
    
    return returnId;
  };

  // Sales functions
  const completeSale = (sale: Omit<Sale, 'id'>) => {
    if (!currentUser) return;

    const newSaleId = Date.now().toString();
    const newSale: Sale = { 
      ...sale, 
      id: newSaleId,
      status: sale.payments.some(p => p.type === 'credit') ? 'credit' : 'completed'
    };
    
    setSales(prev => [...prev, newSale]);
    
    // Update customer credit balance if this is a credit sale
    if (newSale.status === 'credit' && newSale.customerId) {
      const customer = getCustomer(newSale.customerId);
      if (customer) {
        updateCustomer(customer.id, {
          creditBalance: (customer.creditBalance || 0) + newSale.total
        });
      }
    }
    
    // Register cash entry if cash payment
    const cashPayments = sale.payments.filter(p => p.type === 'cash');
    if (cashPayments.length > 0 && currentUser) {
      const totalCash = cashPayments.reduce((sum, p) => sum + p.amount, 0);
      addCashEntry({
        type: 'sale',
        amount: totalCash,
        description: `Venta ${sale.receiptNumber}`,
        userId: currentUser.id
      });
    }
    
    // Update product stock
    sale.items.forEach(item => {
      updateProduct(item.productId, {
        stock: (getProduct(item.productId)?.stock || 0) - item.quantity
      });
    });
    
    clearCart();
  };

  return (
    <PosContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      customers,
      addCustomer,
      updateCustomer,
      getCustomer,
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartSubtotal,
      cartTax,
      sales,
      completeSale,
      getSale,
      processReturn,
      returnedItems,
      getCustomerCreditBalance,
      getCreditSales,
      updateCreditSale,
      currentUser
    }}>
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};


import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, CartItem, Sale, User } from '@/types/pos';

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
  addToCart: (product: Product, quantity: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartSubtotal: number;
  cartTax: number;
  
  // Sales
  sales: Sale[];
  completeSale: (sale: Omit<Sale, 'id'>) => void;
  
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: '1',
    name: 'Admin User',
    email: 'admin@pos.com',
    role: 'admin'
  });

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
        cost: 50.00,
        stock: 15,
        minStock: 10,
        category: 'Panadería',
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
        address: 'Calle Principal 123, Santo Domingo'
      },
      {
        id: '2',
        name: 'María García',
        email: 'maria@email.com',
        phone: '809-555-5678',
        document: '001-2345678-9',
        address: 'Av. Winston Churchill 456, Santo Domingo'
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
    const newCustomer = { ...customer, id: Date.now().toString() };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const getCustomer = (id: string) => {
    return customers.find(c => c.id === id);
  };

  // Cart functions
  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        taxRate: product.taxRate
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

  // Sales functions
  const completeSale = (sale: Omit<Sale, 'id'>) => {
    const newSale = { ...sale, id: Date.now().toString() };
    setSales(prev => [...prev, newSale]);
    
    // Update product stock
    cart.forEach(item => {
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
      currentUser,
      setCurrentUser
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

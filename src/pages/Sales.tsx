
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProductSearch from '@/components/sales/ProductSearch';
import ShoppingCart from '@/components/sales/ShoppingCart';
import PaymentModal from '@/components/sales/PaymentModal';
import SalesHistory from '@/components/sales/SalesHistory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { ShoppingCart as CartIcon, CreditCard, User, History, Tag, Search } from 'lucide-react';

const Sales = () => {
  const { cart, cartTotal, customers, addToCart, products } = usePos();
  const [showPayment, setShowPayment] = useState(false);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('no-customer');
  const [useWholesalePrices, setUseWholesalePrices] = useState(false);
  const [returnData, setReturnData] = useState<{ returnAmount: number, returnId: string } | null>(null);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPayment(true);
  };

  const selectedCustomerData = selectedCustomer && selectedCustomer !== 'no-customer' 
    ? customers.find(c => c.id === selectedCustomer) 
    : null;

  // Handle customer selection and automatically set wholesale pricing based on customer type
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    if (customerId === 'no-customer') {
      setUseWholesalePrices(false);
    } else {
      const customer = customers.find(c => c.id === customerId);
      if (customer?.isWholesale) {
        setUseWholesalePrices(true);
      }
    }
  };

  // Enhanced product addition with wholesale pricing
  const handleAddProduct = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(product, quantity, useWholesalePrices);
    }
  };

  // Handle return selection from sales history
  const handleReturnSelection = (returnAmount: number, returnId: string) => {
    setReturnData({ returnAmount, returnId });
    setShowPayment(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
            <p className="text-gray-600">Sistema completo e interactivo de ventas</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowSalesHistory(true)}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Historial de Ventas
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Product Search */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Búsqueda de Productos</h2>
                {useWholesalePrices && (
                  <Badge variant="secondary" className="ml-auto">
                    <Tag className="h-3 w-3 mr-1" />
                    Precios Mayoristas
                  </Badge>
                )}
              </div>
              
              <ProductSearch 
                onAddToCart={handleAddProduct}
                useWholesalePrices={useWholesalePrices}
              />
              
              {/* Wholesale Pricing Toggle */}
              <div className="flex items-center justify-end mt-4 gap-2 border-t pt-4">
                <span className="text-sm text-gray-600">Precios Mayoristas</span>
                <Switch 
                  checked={useWholesalePrices} 
                  onCheckedChange={setUseWholesalePrices}
                  disabled={selectedCustomer !== 'no-customer' && !selectedCustomerData?.isWholesale}
                />
              </div>
            </Card>
          </div>

          {/* Shopping Cart */}
          <div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CartIcon className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Carrito de Compras</h2>
                {cart.length > 0 && (
                  <Badge variant="outline" className="ml-auto">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                  </Badge>
                )}
              </div>

              {/* Customer Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Cliente (Opcional)
                </label>
                <Select value={selectedCustomer} onValueChange={handleCustomerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-customer">Sin cliente</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {customer.name}
                            {customer.isWholesale && ' (Mayorista)'}
                          </span>
                          {customer.document && (
                            <span className="text-xs text-gray-500">{customer.document}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCustomerData && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <p className="font-medium">{selectedCustomerData.name}</p>
                    {selectedCustomerData.email && (
                      <p className="text-gray-600">{selectedCustomerData.email}</p>
                    )}
                    {selectedCustomerData.phone && (
                      <p className="text-gray-600">{selectedCustomerData.phone}</p>
                    )}
                    {selectedCustomerData.isWholesale && (
                      <p className="text-blue-600 font-medium">Cliente Mayorista</p>
                    )}
                    {(selectedCustomerData.creditLimit !== undefined && selectedCustomerData.creditLimit > 0) && (
                      <p className="text-green-600">
                        Crédito: RD$ {(selectedCustomerData.creditLimit - (selectedCustomerData.creditBalance || 0)).toLocaleString()} disponible
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <ShoppingCart />
              
              {cart.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>RD$ {cartTotal.toLocaleString()}</span>
                    </div>
                    
                    {returnData && returnData.returnAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Devolución aplicada:</span>
                        <span>- RD$ {returnData.returnAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleCheckout}
                    className="w-full"
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Procesar Pago
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <PaymentModal 
        open={showPayment} 
        onClose={() => {
          setShowPayment(false);
          setReturnData(null);
        }}
        selectedCustomer={selectedCustomerData}
        returnAmount={returnData?.returnAmount}
        returnId={returnData?.returnId}
      />
      
      <SalesHistory
        open={showSalesHistory}
        onClose={() => setShowSalesHistory(false)}
        onSelectReturn={handleReturnSelection}
      />
    </Layout>
  );
};

export default Sales;

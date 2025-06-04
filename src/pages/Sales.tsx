
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProductSearch from '@/components/sales/ProductSearch';
import ShoppingCart from '@/components/sales/ShoppingCart';
import PaymentModal from '@/components/sales/PaymentModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePos } from '@/contexts/PosContext';
import { ShoppingCart as CartIcon, CreditCard, User } from 'lucide-react';

const Sales = () => {
  const { cart, cartTotal, customers } = usePos();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPayment(true);
  };

  const selectedCustomerData = selectedCustomer ? customers.find(c => c.id === selectedCustomer) : null;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
          <p className="text-gray-600">Procesa transacciones de venta</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Search */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <ProductSearch />
            </Card>
          </div>

          {/* Shopping Cart */}
          <div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CartIcon className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Carrito de Compras</h2>
              </div>

              {/* Customer Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Cliente (Opcional)
                </label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin cliente</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{customer.name}</span>
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
        onClose={() => setShowPayment(false)}
        selectedCustomer={selectedCustomerData}
      />
    </Layout>
  );
};

export default Sales;

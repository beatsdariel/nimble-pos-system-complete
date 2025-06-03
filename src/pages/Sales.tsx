
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProductSearch from '@/components/sales/ProductSearch';
import ShoppingCart from '@/components/sales/ShoppingCart';
import PaymentModal from '@/components/sales/PaymentModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePos } from '@/contexts/PosContext';
import { ShoppingCart as CartIcon, CreditCard } from 'lucide-react';

const Sales = () => {
  const { cart, cartTotal } = usePos();
  const [showPayment, setShowPayment] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPayment(true);
  };

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
      />
    </Layout>
  );
};

export default Sales;

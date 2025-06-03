
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProductSearch from '@/components/sales/ProductSearch';
import ShoppingCart from '@/components/sales/ShoppingCart';
import PaymentModal from '@/components/sales/PaymentModal';
import SalesActionButtons from '@/components/sales/SalesActionButtons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePos } from '@/contexts/PosContext';
import { ShoppingCart as CartIcon, User, Calendar, Hash } from 'lucide-react';

const Sales = () => {
  const { cart, cartTotal, cartSubtotal, cartTax } = usePos();
  const [showPayment, setShowPayment] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState('');
  const [currentDate] = useState(new Date().toLocaleDateString('es-DO'));
  const [currentUser] = useState('DARIEL GRULLON');
  const [receiptNumber] = useState('568589');

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPayment(true);
  };

  return (
    <Layout>
      <div className="h-full bg-gray-100 p-4">
        {/* Header con información de sesión */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Cliente:</span>
                <Input 
                  value={currentCustomer}
                  onChange={(e) => setCurrentCustomer(e.target.value)}
                  placeholder="Seleccionar cliente"
                  className="h-8 w-48"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">{currentDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Usuario:</span>
                <span className="font-medium">{currentUser}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Caja #:</span>
                <span className="font-medium">01</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Turno #:</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Último Control:</span>
                <span className="font-medium">{receiptNumber}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
          {/* Lista de productos vendidos */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
              <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-gray-700">
                <span>CANT.</span>
                <span className="col-span-2">DESCRIPCIÓN</span>
                <span>PRECIO</span>
                <span>IMPORTE</span>
              </div>
            </div>
            <div className="p-4 h-80 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No hay productos en la venta</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div key={item.productId} className="grid grid-cols-5 gap-4 text-sm py-2 border-b border-gray-100">
                      <span className="font-medium">{item.quantity}</span>
                      <span className="col-span-2 text-gray-700">{item.name}</span>
                      <span>RD$ {item.price.toLocaleString()}</span>
                      <span className="font-medium">RD$ {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Total section */}
            <div className="border-t bg-gray-50 p-4 rounded-b-lg">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total de Ítems: <span className="font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    TOTAL A PAGAR: RD$ {cartTotal.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Subtotal: RD$ {cartSubtotal.toLocaleString()} | ITBIS: RD$ {cartTax.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Búsqueda de productos */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Búsqueda de Productos</h3>
              <ProductSearch />
            </div>
          </div>

          {/* Panel de acciones */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <SalesActionButtons onCheckout={handleCheckout} />
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

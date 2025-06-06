
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePos } from '@/contexts/PosContext';
import CentralProductSearch from './CentralProductSearch';
import CustomerSelector from './CustomerSelector';
import HoldOrderManager from './HoldOrderManager';
import { ShoppingCart, Trash2, User, Clock, Receipt, Minus, Plus, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface ModernPosInterfaceProps {
  onShowPayment: () => void;
  onShowHistory: () => void;
  selectedCustomer: string;
  onCustomerChange: (customerId: string) => void;
  useWholesalePrices: boolean;
  onWholesalePriceChange: (useWholesale: boolean) => void;
}

const ModernPosInterface: React.FC<ModernPosInterfaceProps> = ({
  onShowPayment,
  onShowHistory,
  selectedCustomer,
  onCustomerChange,
  useWholesalePrices,
  onWholesalePriceChange
}) => {
  const { 
    cart, 
    cartTotal, 
    cartSubtotal, 
    cartTax, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    customers,
    getCustomer,
    addToCart,
    getProduct
  } = usePos();

  const [showHoldOrders, setShowHoldOrders] = useState(false);

  const selectedCustomerData = selectedCustomer && selectedCustomer !== 'no-customer' 
    ? getCustomer(selectedCustomer) 
    : null;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast.success('Producto eliminado del carrito');
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Carrito limpiado');
  };

  const handleResumeOrder = (order: any) => {
    clearCart();
    order.items.forEach((item: any) => {
      const product = getProduct(item.productId);
      if (product) {
        addToCart(product, item.quantity, item.isWholesalePrice);
      }
    });
    toast.success(`Pedido ${order.id} reanudado`);
  };

  const currentDate = new Date().toLocaleDateString();
  const currentUser = "ADMIN";
  const registerNumber = "01";
  const shiftNumber = "1";

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header with total */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold">
            $ {cartTotal.toFixed(2)}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              // Hold order functionality
              toast.info('Pedido guardado como abierto');
            }}
          >
            <Clock className="h-4 w-4" />
            DEJAR PEDIDO ABIERTO
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-6 py-4 border-b">
        <CentralProductSearch 
          useWholesalePrices={useWholesalePrices}
          onProductSelect={(product) => {
            console.log('Product selected for detailed view:', product);
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Cart */}
        <div className="flex-1 flex flex-col">
          {/* Cart Header */}
          <div className="bg-yellow-400 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-semibold text-lg">Carrito de Compras</span>
              </div>
              <Badge variant="secondary" className="bg-black text-white px-3 py-1">
                {cart.length} ítem(s)
              </Badge>
            </div>
          </div>

          {/* Cart Table Headers */}
          <div className="bg-gray-800 text-white px-6 py-3">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium">
              <div className="col-span-1">CANT.</div>
              <div className="col-span-6">DESCRIPCIÓN</div>
              <div className="col-span-2">PRECIO</div>
              <div className="col-span-3">IMPORTE</div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 bg-white overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="h-16 w-16 mb-4" />
                <p className="text-xl font-medium">Carrito vacío</p>
                <p className="text-sm">Busca productos para agregar</p>
              </div>
            ) : (
              <div className="space-y-0">
                {cart.map((item, index) => (
                  <div key={`${item.productId}-${item.isWholesalePrice}`} 
                       className={`grid grid-cols-12 gap-4 px-6 py-4 border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    {/* Quantity */}
                    <div className="col-span-1 flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                        className="w-12 h-6 text-center text-xs"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Description */}
                    <div className="col-span-6">
                      <div className="font-medium text-sm">{item.name}</div>
                      {item.isWholesalePrice && (
                        <Badge variant="secondary" className="text-xs mt-1">Mayoreo</Badge>
                      )}
                    </div>
                    
                    {/* Price */}
                    <div className="col-span-2 text-sm">
                      RD$ {item.price.toLocaleString()}
                    </div>
                    
                    {/* Total */}
                    <div className="col-span-3 flex justify-between items-center">
                      <span className="font-medium text-sm">
                        RD$ {(item.price * item.quantity).toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.productId)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="bg-gray-200 px-6 py-3 border-t">
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div>
                <span className="font-medium">Cliente: </span>
                <span>{selectedCustomerData?.name || 'CONSUMIDOR FINAL'}</span>
              </div>
              <div>
                <span className="font-medium">Fecha: </span>
                <span>{currentDate}</span>
              </div>
              <div>
                <span className="font-medium">Usuario: </span>
                <span>{currentUser}</span>
              </div>
              <div>
                <span className="font-medium">Caja #: </span>
                <span>{registerNumber}</span>
              </div>
              <div>
                <span className="font-medium">Turno #: </span>
                <span>{shiftNumber}</span>
              </div>
            </div>
          </div>

          {/* Total Section */}
          <div className="bg-white px-6 py-4 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                <span className="font-medium">Total de Ítems: </span>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  TOTAL A PAGAR: RD$ {cartTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Actions Panel */}
        <div className="w-80 bg-white border-l flex flex-col">
          {/* Header */}
          <div className="bg-blue-500 text-white px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span className="font-semibold">Punto de Venta</span>
            </div>
          </div>

          {/* Customer Assignment */}
          <div className="p-4 border-b">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 mb-3"
              onClick={() => {
                // Customer assignment modal
                toast.info('Módulo de asignación de cliente');
              }}
            >
              <User className="h-4 w-4" />
              ASIGNAR CLIENTE
            </Button>
            
            <CustomerSelector
              selectedCustomer={selectedCustomer}
              onCustomerChange={onCustomerChange}
              customers={customers}
            />
          </div>

          {/* Order Management */}
          <div className="p-4 border-b space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => setShowHoldOrders(true)}
            >
              <Clock className="h-4 w-4" />
              VER PEDIDOS ABIERTOS
            </Button>
          </div>

          {/* Sales History */}
          <div className="p-4 border-b">
            <Button
              className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
              onClick={onShowHistory}
            >
              <Receipt className="h-4 w-4" />
              HISTORIAL DE VENTAS
            </Button>
          </div>

          {/* Account Management */}
          <div className="p-4 border-b space-y-3">
            <Button
              variant="outline"
              className="w-full bg-green-100 hover:bg-green-200 border-green-300"
              onClick={() => {
                toast.info('Módulo de cobrar cuenta');
              }}
            >
              💰 COBRAR CUENTA (F4)
            </Button>
          </div>

          {/* Line Actions */}
          <div className="p-4 border-b space-y-3">
            <Button
              variant="outline"
              className="w-full bg-red-100 hover:bg-red-200 border-red-300"
              onClick={() => {
                if (cart.length > 0) {
                  const lastItem = cart[cart.length - 1];
                  removeFromCart(lastItem.productId);
                  toast.success('Última línea borrada');
                }
              }}
            >
              🗑️ BORRAR LÍNEA
            </Button>
            
            <Button
              variant="outline"
              className="w-full bg-red-100 hover:bg-red-200 border-red-300"
              onClick={handleClearCart}
            >
              🧹 LIMPIAR TODO
            </Button>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Checkout Button */}
          {cart.length > 0 && (
            <div className="p-4">
              <Button
                onClick={onShowPayment}
                className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
              >
                💳 PROCESAR PAGO
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Hold Orders Manager */}
      <HoldOrderManager
        open={showHoldOrders}
        onClose={() => setShowHoldOrders(false)}
        onResumeOrder={handleResumeOrder}
      />
    </div>
  );
};

export default ModernPosInterface;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePos } from '@/contexts/PosContext';
import CentralProductSearch from './CentralProductSearch';
import CustomerSelector from './CustomerSelector';
import HoldOrderManager from './HoldOrderManager';
import { ShoppingCart, Trash2, User, Calculator, CreditCard, Receipt, Archive, Clock } from 'lucide-react';
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header Section - Fixed */}
      <div className="bg-white shadow-sm border-b p-4 flex-shrink-0">
        {/* Central Search Bar */}
        <div className="mb-4">
          <CentralProductSearch 
            useWholesalePrices={useWholesalePrices}
            onProductSelect={(product) => {
              console.log('Product selected for detailed view:', product);
            }}
          />
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Customer Selection */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-blue-600" />
                <Label className="text-sm font-medium">Cliente</Label>
              </div>
              <CustomerSelector
                selectedCustomer={selectedCustomer}
                onCustomerChange={onCustomerChange}
                customers={customers}
              />
              {selectedCustomerData && (
                <div className="mt-2 text-xs text-gray-600">
                  <p>Teléfono: {selectedCustomerData.phone || 'N/A'}</p>
                  {selectedCustomerData.isWholesale && (
                    <Badge variant="secondary" className="mt-1">
                      Cliente Mayorista
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Mode */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-green-600" />
                <Label className="text-sm font-medium">Modo de Precio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="wholesale-mode"
                  checked={useWholesalePrices}
                  onCheckedChange={onWholesalePriceChange}
                />
                <Label htmlFor="wholesale-mode" className="text-sm">
                  {useWholesalePrices ? 'Mayoreo' : 'Menudeo'}
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {useWholesalePrices ? 'Precios al por mayor' : 'Precios al por menor'}
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Archive className="h-4 w-4 text-purple-600" />
                <Label className="text-sm font-medium">Pedidos</Label>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowHoldOrders(true)}
                >
                  <Clock className="h-3 w-3 mr-2" />
                  Pedidos Abiertos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="h-4 w-4 text-orange-600" />
                <Label className="text-sm font-medium">Acciones</Label>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onShowHistory}
                >
                  <Receipt className="h-3 w-3 mr-2" />
                  Historial
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area - Flexible */}
      <div className="flex-1 flex overflow-hidden">
        {/* Product Grid - Left Side */}
        <div className="flex-1 p-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Productos Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="text-center text-gray-500 mt-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Usa la barra de búsqueda superior para encontrar productos</p>
                <p className="text-sm">O escanea un código de barras</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shopping Cart - Right Side - Fixed Width */}
        <div className="w-96 p-4 flex-shrink-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito ({cart.length})
                </CardTitle>
                {cart.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleClearCart}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {/* Cart Items - Scrollable */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Carrito vacío</p>
                    <p className="text-sm">Agrega productos para comenzar</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={`${item.productId}-${item.isWholesalePrice}`} className="border rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            +
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            RD$ {(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            RD$ {item.price.toLocaleString()} c/u
                          </p>
                          {item.isWholesalePrice && (
                            <Badge variant="secondary" className="text-xs">
                              Mayoreo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Summary - Fixed at bottom */}
              {cart.length > 0 && (
                <div className="flex-shrink-0 border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>RD$ {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ITBIS:</span>
                    <span>RD$ {cartTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>RD$ {cartTotal.toLocaleString()}</span>
                  </div>
                  
                  <Button 
                    onClick={onShowPayment} 
                    className="w-full mt-4"
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Procesar Pago
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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

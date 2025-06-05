
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePos } from '@/contexts/PosContext';
import { ShoppingCart, User, Search, Trash2, CreditCard, X, Plus, Minus, Clock, History } from 'lucide-react';
import { toast } from 'sonner';
import CustomerSelector from './CustomerSelector';
import HoldOrderManager from './HoldOrderManager';
import CentralProductSearch from './CentralProductSearch';

interface ModernPosInterfaceProps {
  onShowPayment: () => void;
  onShowHistory: () => void;
  selectedCustomer: string;
  onCustomerChange: (customerId: string) => void;
  useWholesalePrices: boolean;
  onWholesalePriceChange: (use: boolean) => void;
}

const ModernPosInterface: React.FC<ModernPosInterfaceProps> = ({
  onShowPayment,
  onShowHistory,
  selectedCustomer,
  onCustomerChange,
  useWholesalePrices,
  onWholesalePriceChange
}) => {
  const { products, cart, addToCart, updateCartQuantity, removeFromCart, cartTotal, customers, clearCart } = usePos();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showHoldManager, setShowHoldManager] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [holdOrder, setHoldOrder] = useState(false);

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowProductDialog(true);
  };

  const handleAddToCart = () => {
    if (selectedProduct && quantity > 0) {
      addToCart(selectedProduct, quantity, useWholesalePrices);
      setShowProductDialog(false);
      setSelectedProduct(null);
      toast.success(`${selectedProduct.name} agregado al carrito`);
    }
  };

  const handleHoldOrder = () => {
    if (cart.length === 0) {
      toast.error('No hay productos en el carrito para dejar abierto');
      return;
    }

    // Simulate saving hold order
    const holdOrderData = {
      id: `HOLD-${Date.now()}`,
      customerName: customers.find(c => c.id === selectedCustomer)?.name || 'CONSUMIDOR FINAL',
      customerId: selectedCustomer === 'no-customer' ? undefined : selectedCustomer,
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: cartTotal,
      holdDate: new Date().toLocaleDateString(),
      holdTime: new Date().toLocaleTimeString(),
      userId: 'current-user'
    };

    console.log('Saving hold order:', holdOrderData);
    clearCart();
    setHoldOrder(false);
    toast.success('Pedido guardado como abierto');
  };

  const handleResumeOrder = (order: any) => {
    // Clear current cart and load held order
    clearCart();
    
    // Set customer
    if (order.customerId) {
      onCustomerChange(order.customerId);
    } else {
      onCustomerChange('no-customer');
    }

    // Add items to cart
    order.items.forEach((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        addToCart(product, item.quantity, useWholesalePrices);
      }
    });

    toast.success(`Pedido ${order.id} reanudado`);
  };

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header with Central Search */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">$</div>
            <div className="text-xl font-bold text-right">
              {cartTotal.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={holdOrder ? "default" : "outline"}
              onClick={() => setHoldOrder(!holdOrder)}
              className="text-sm"
            >
              <Clock className="h-4 w-4 mr-1" />
              {holdOrder ? "CANCELAR HOLD" : "DEJAR PEDIDO ABIERTO"}
            </Button>
            {holdOrder && (
              <Button
                onClick={handleHoldOrder}
                className="bg-orange-500 hover:bg-orange-600"
              >
                GUARDAR PEDIDO
              </Button>
            )}
          </div>
        </div>

        {/* Central Product Search */}
        <CentralProductSearch
          useWholesalePrices={useWholesalePrices}
          onProductSelect={handleProductSelect}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Cart Display */}
        <div className="flex-1 flex flex-col">
          {/* Cart Header */}
          <div className="bg-yellow-200 p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="font-medium">Carrito de Compras</span>
              </div>
              <Badge variant="default">
                {cart.length} item(s)
              </Badge>
            </div>
          </div>

          {/* Cart Table */}
          <div className="flex-1 bg-white">
            <div className="grid grid-cols-4 bg-gray-800 text-white text-sm font-medium">
              <div className="p-2 border-r border-gray-600">CANT.</div>
              <div className="p-2 border-r border-gray-600">DESCRIPCION</div>
              <div className="p-2 border-r border-gray-600">PRECIO</div>
              <div className="p-2">IMPORTE</div>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              {cart.map((item, index) => (
                <div key={`${item.productId}-${item.isWholesalePrice}`} className="grid grid-cols-4 border-b text-sm hover:bg-gray-50">
                  <div className="p-2 border-r flex items-center gap-2">
                    <span>{item.quantity}</span>
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-5 w-5 p-0"
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-5 w-5 p-0"
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-2 border-r">
                    <div>{item.name}</div>
                    {item.isWholesalePrice && (
                      <Badge variant="secondary" className="text-xs mt-1">Mayorista</Badge>
                    )}
                  </div>
                  <div className="p-2 border-r">RD$ {item.price.toFixed(2)}</div>
                  <div className="p-2 flex justify-between items-center">
                    <span>RD$ {(item.price * item.quantity).toFixed(2)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.productId)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {cart.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Carrito vacío</p>
                  <p className="text-sm">Busca productos para agregar</p>
                </div>
              )}
            </div>
          </div>

          {/* Cart Footer */}
          <div className="bg-gray-800 text-white p-2">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                <span className="bg-black px-2 py-1 rounded">Total de Items: {cart.length}</span>
              </div>
              <div className="text-lg font-bold">
                TOTAL A PAGAR: RD$ {cartTotal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="bg-gray-200 p-2 text-xs flex justify-between">
            <div>Cliente: {selectedCustomerData?.name || 'CONSUMIDOR FINAL'}</div>
            <div>Fecha: {new Date().toLocaleDateString()}</div>
            <div>Usuario: ADMIN</div>
            <div>Caja #: 01</div>
            <div>Turno #: 1</div>
          </div>
        </div>

        {/* Right Panel - Controls */}
        <div className="w-80 bg-white border-l flex flex-col">
          {/* Product Image/Info */}
          <div className="h-48 bg-gray-100 flex items-center justify-center border-b">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600">
                {selectedProduct?.name || 'Punto de Venta'}
              </div>
              {selectedCustomerData && (
                <Badge className="mt-2">
                  {selectedCustomerData.isWholesale ? 'Cliente Mayorista' : 'Cliente Detalle'}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 space-y-2">
            <Button 
              onClick={() => setShowCustomerSelector(true)}
              className="w-full"
              variant="outline"
            >
              <User className="h-4 w-4 mr-2" />
              ASIGNAR CLIENTE
            </Button>
            
            <Button 
              onClick={() => setShowHoldManager(true)}
              className="w-full"
              variant="outline"
            >
              <Clock className="h-4 w-4 mr-2" />
              VER PEDIDOS ABIERTOS
            </Button>
            
            <Button 
              onClick={onShowHistory}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              <History className="h-4 w-4 mr-2" />
              HISTORIAL DE VENTAS
            </Button>
          </div>

          {/* Wholesale Price Toggle */}
          {selectedCustomerData?.isWholesale && (
            <div className="p-4 border-t">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useWholesalePrices}
                  onChange={(e) => onWholesalePriceChange(e.target.checked)}
                />
                <span className="text-sm">Usar precios mayoristas</span>
              </label>
            </div>
          )}

          {/* Action Buttons Bottom */}
          <div className="p-4 border-t space-y-2 mt-auto">
            <Button 
              onClick={onShowPayment}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
              disabled={cart.length === 0}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              COBRAR CUENTA (F4)
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="destructive"
                onClick={() => {
                  if (cart.length > 0) {
                    removeFromCart(cart[cart.length - 1].productId);
                    toast.success('Último item eliminado');
                  }
                }}
                disabled={cart.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                BORRAR LÍNEA
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  clearCart();
                  toast.success('Carrito limpiado');
                }}
                disabled={cart.length === 0}
              >
                <X className="h-4 w-4 mr-1" />
                LIMPIAR TODO
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Producto</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                <p className="text-sm text-gray-500">Stock disponible: {selectedProduct.stock}</p>
                <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Cantidad:</label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-20 text-center"
                    min="1"
                    max={selectedProduct.stock}
                  />
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>RD$ {((useWholesalePrices && selectedProduct.wholesalePrice ? selectedProduct.wholesalePrice : selectedProduct.price) * quantity).toFixed(2)}</span>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddToCart} className="flex-1">
                  Agregar al Carrito
                </Button>
                <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Selector */}
      <CustomerSelector
        open={showCustomerSelector}
        onClose={() => setShowCustomerSelector(false)}
        selectedCustomer={selectedCustomer}
        onCustomerSelect={onCustomerChange}
      />

      {/* Hold Order Manager */}
      <HoldOrderManager
        open={showHoldManager}
        onClose={() => setShowHoldManager(false)}
        onResumeOrder={handleResumeOrder}
      />
    </div>
  );
};

export default ModernPosInterface;

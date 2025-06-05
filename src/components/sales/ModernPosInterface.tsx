
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePos } from '@/contexts/PosContext';
import { ShoppingCart, User, Search, Trash2, Calculator, CreditCard, X, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

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
  const { products, cart, addToCart, updateCartQuantity, removeFromCart, cartTotal, customers } = usePos();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [holdOrder, setHoldOrder] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
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
              {holdOrder ? "REANUDAR CUENTA" : "DEJAR PEDIDO ABIERTO / HOLD"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Product Selection */}
        <div className="flex-1 flex flex-col">
          {/* Search Bar */}
          <div className="bg-yellow-200 p-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Cantidad"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white"
              />
              <Button size="sm" variant="outline">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Table */}
          <div className="flex-1 bg-white">
            <div className="grid grid-cols-4 bg-gray-800 text-white text-sm font-medium">
              <div className="p-2 border-r border-gray-600">CANT.</div>
              <div className="p-2 border-r border-gray-600">DESCRIPCION</div>
              <div className="p-2 border-r border-gray-600">PRECIO</div>
              <div className="p-2">IMPORTE</div>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              {cart.map((item, index) => (
                <div key={item.productId} className="grid grid-cols-4 border-b text-sm hover:bg-gray-50">
                  <div className="p-2 border-r">{item.quantity}</div>
                  <div className="p-2 border-r">{item.name}</div>
                  <div className="p-2 border-r">RD$ {item.price.toFixed(2)}</div>
                  <div className="p-2">RD$ {(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
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
            <div>Usuario: {selectedCustomerData?.name || 'USUARIO'}</div>
            <div>Caja #: 01</div>
            <div>Turno #: 1</div>
            <div>Ultimo Control: 558589</div>
          </div>
        </div>

        {/* Right Panel - Controls */}
        <div className="w-80 bg-white border-l flex flex-col">
          {/* Product Image */}
          <div className="h-48 bg-gray-100 flex items-center justify-center border-b">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600">
                {selectedProduct?.name || 'Selecciona un producto'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 space-y-2">
            <Button 
              onClick={() => setShowProductDialog(true)}
              className="w-full"
              variant="outline"
            >
              <User className="h-4 w-4 mr-2" />
              ASIGNAR CLIENTE
            </Button>
            
            <Button 
              onClick={onShowHistory}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              <Search className="h-4 w-4 mr-2" />
              BUSCAR PEDIDO
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-t">
            <div className="flex">
              <Button
                variant={activeTab === 'general' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('general')}
                className="flex-1 rounded-none"
              >
                GENERAL
              </Button>
              <Button
                variant={activeTab === 'articulos' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('articulos')}
                className="flex-1 rounded-none bg-blue-500 text-white"
              >
                ARTICULO(S)
              </Button>
              <Button
                variant={activeTab === 'detalles' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('detalles')}
                className="flex-1 rounded-none"
              >
                DETALLES
              </Button>
            </div>
          </div>

          {/* Product Search */}
          {activeTab === 'articulos' && (
            <div className="p-4 flex-1 overflow-y-auto">
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              
              <div className="space-y-2">
                {filteredProducts.slice(0, 10).map((product) => (
                  <Card 
                    key={product.id} 
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.description}</p>
                        <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs">
                          {product.stock}
                        </Badge>
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          RD$ {(useWholesalePrices && product.wholesalePrice ? product.wholesalePrice : product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons Bottom */}
          <div className="p-4 border-t space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={onShowPayment}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={cart.length === 0}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                COBRAR CUENTA (END)
              </Button>
              
              <Button 
                variant="destructive"
                onClick={() => {
                  if (cart.length > 0) {
                    removeFromCart(cart[cart.length - 1].productId);
                  }
                }}
              >
                <X className="h-4 w-4 mr-1" />
                BORRAR LINEA
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline"
                className="bg-blue-100"
              >
                <Plus className="h-4 w-4 mr-1" />
                RE-INSERTAR ARTICULO
              </Button>
              
              <Button 
                variant="outline"
                className="bg-orange-100"
              >
                →
                RETORNAR
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
    </div>
  );
};

export default ModernPosInterface;

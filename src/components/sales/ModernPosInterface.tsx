
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePos } from '@/contexts/PosContext';
import CentralProductSearch from './CentralProductSearch';
import CustomerSelector from './CustomerSelector';
import HoldOrderManager from './HoldOrderManager';
import QuickCustomerModal from './QuickCustomerModal';
import CollectAccountModal from './CollectAccountModal';
import CashClosureModal from '../cash/CashClosureModal';
import AccessKeyModal from '../common/AccessKeyModal';
import { ShoppingCart, Trash2, User, Clock, Receipt, Minus, Plus, BarChart3, UserPlus, DollarSign, Search, Calculator } from 'lucide-react';
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
    getProduct,
    currentShift,
    processBarcodeCommand,
    addCashClosure,
    holdCurrentOrder,
    validateAccessKey
  } = usePos();

  const [showHoldOrders, setShowHoldOrders] = useState(false);
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [showCollectAccount, setShowCollectAccount] = useState(false);
  const [showCashClosure, setShowCashClosure] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{action: string, callback: () => void} | null>(null);
  const [holdOrderNote, setHoldOrderNote] = useState('');

  const selectedCustomerData = selectedCustomer && selectedCustomer !== 'no-customer' 
    ? getCustomer(selectedCustomer) 
    : null;

  // Handle barcode submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      processBarcodeCommand(barcodeInput.trim());
      setBarcodeInput('');
    }
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast.success('Producto eliminado del carrito');
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const requestAccess = (action: string, title: string, callback: () => void) => {
    setPendingAction({ action, callback });
    setShowAccessModal(true);
  };

  const handleAccessSuccess = () => {
    if (pendingAction) {
      pendingAction.callback();
      setPendingAction(null);
    }
  };

  const handleClearCart = () => {
    requestAccess('clear-cart', 'Limpiar Todo', () => {
      clearCart();
      toast.success('Carrito limpiado');
    });
  };

  const handleDeleteLine = () => {
    requestAccess('delete-line', 'Borrar Línea', () => {
      if (cart.length > 0) {
        const lastItem = cart[cart.length - 1];
        removeFromCart(lastItem.productId);
        toast.success('Última línea borrada');
      }
    });
  };

  const handleShowHistory = () => {
    requestAccess('sales-history', 'Historial de Ventas', onShowHistory);
  };

  const handleShowQuickCustomer = () => {
    requestAccess('add-customer', 'Agregar Cliente', () => setShowQuickCustomer(true));
  };

  const handleShowCollectAccount = () => {
    requestAccess('collect-accounts', 'Cobrar Cuentas', () => setShowCollectAccount(true));
  };

  const handleCustomerCreated = (customerId: string) => {
    onCustomerChange(customerId);
    toast.success('Cliente creado y seleccionado');
  };

  const handleCashClosure = (closureData: any) => {
    addCashClosure(closureData);
  };

  const handleHoldOrder = () => {
    const prompt = window.prompt('Ingrese una nota para el pedido (opcional):');
    const note = prompt || '';
    holdCurrentOrder(note);
  };

  const currentDate = new Date().toLocaleDateString();
  const currentUser = "ADMIN";
  const registerNumber = "01";
  const shiftNumber = currentShift?.shiftId || "1";

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header Fijo */}
      <div className="bg-white shadow-sm border-b px-6 py-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="text-2xl font-bold">
              $ {cartTotal.toFixed(2)}
            </div>
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Código/+cantidad (ej: +2)"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-48"
              />
              <Button type="submit" size="sm">Agregar</Button>
            </form>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleHoldOrder}
              disabled={cart.length === 0}
            >
              <Clock className="h-4 w-4" />
              DEJAR ABIERTO
            </Button>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda Fija */}
      <div className="bg-white px-6 py-3 border-b flex-shrink-0">
        <CentralProductSearch 
          useWholesalePrices={useWholesalePrices}
          onProductSelect={(product) => {
            console.log('Product selected for detailed view:', product);
          }}
        />
      </div>

      {/* Contenido Principal - Layout Fijo */}
      <div className="flex-1 flex overflow-hidden">
        {/* Área del Carrito - Fija */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header del Carrito */}
          <div className="bg-yellow-400 px-6 py-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-semibold">Carrito de Compras</span>
              </div>
              <Badge variant="secondary" className="bg-black text-white">
                {cart.length} ítem(s)
              </Badge>
            </div>
          </div>

          {/* Headers de Tabla */}
          <div className="bg-gray-800 text-white px-6 py-2 flex-shrink-0">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium">
              <div className="col-span-1">CANT.</div>
              <div className="col-span-6">DESCRIPCIÓN</div>
              <div className="col-span-2">PRECIO</div>
              <div className="col-span-3">IMPORTE</div>
            </div>
          </div>

          {/* Lista de Productos - Scrollable */}
          <div className="flex-1 overflow-y-auto">
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
                       className={`grid grid-cols-12 gap-4 px-6 py-3 border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    {/* Cantidad */}
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
                    
                    {/* Descripción */}
                    <div className="col-span-6">
                      <div className="font-medium text-sm">{item.name}</div>
                      {item.isWholesalePrice && (
                        <Badge variant="secondary" className="text-xs mt-1">Mayoreo</Badge>
                      )}
                    </div>
                    
                    {/* Precio */}
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

          {/* Footer Info - Fijo */}
          <div className="bg-gray-200 px-6 py-2 border-t flex-shrink-0">
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

          {/* Total Section - Fijo */}
          <div className="bg-white px-6 py-3 border-t flex-shrink-0">
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

        {/* Panel Lateral de Acciones - Fijo */}
        <div className="w-80 bg-white border-l flex flex-col flex-shrink-0">
          {/* Header */}
          <div className="bg-blue-500 text-white px-4 py-3 text-center flex-shrink-0">
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span className="font-semibold">Punto de Venta</span>
            </div>
          </div>

          {/* Contenido Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Customer Management */}
            <div className="p-4 border-b space-y-3">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleShowQuickCustomer}
              >
                <UserPlus className="h-4 w-4" />
                AGREGAR CLIENTE
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
              
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => setShowHoldOrders(true)}
              >
                <Search className="h-4 w-4" />
                BUSCAR PEDIDOS
              </Button>
            </div>

            {/* Account Management */}
            <div className="p-4 border-b space-y-3">
              <Button
                variant="outline"
                className="w-full bg-green-100 hover:bg-green-200 border-green-300"
                onClick={handleShowCollectAccount}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                COBRAR CUENTAS
              </Button>
            </div>

            {/* Cash Management */}
            <div className="p-4 border-b space-y-3">
              <Button
                variant="outline"
                className="w-full bg-purple-100 hover:bg-purple-200 border-purple-300"
                onClick={() => setShowCashClosure(true)}
              >
                <Calculator className="h-4 w-4 mr-2" />
                CUADRE DE CAJA
              </Button>
            </div>

            {/* Sales History */}
            <div className="p-4 border-b">
              <Button
                className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                onClick={handleShowHistory}
              >
                <Receipt className="h-4 w-4" />
                HISTORIAL DE VENTAS
              </Button>
            </div>

            {/* Line Actions */}
            <div className="p-4 border-b space-y-3">
              <Button
                variant="outline"
                className="w-full bg-red-100 hover:bg-red-200 border-red-300"
                onClick={handleDeleteLine}
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
          </div>

          {/* Checkout Button - Fijo */}
          {cart.length > 0 && (
            <div className="p-4 flex-shrink-0">
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

      {/* Modals */}
      <HoldOrderManager
        open={showHoldOrders}
        onClose={() => setShowHoldOrders(false)}
      />
      
      <QuickCustomerModal
        open={showQuickCustomer}
        onClose={() => setShowQuickCustomer(false)}
        onCustomerCreated={handleCustomerCreated}
      />
      
      <CollectAccountModal
        open={showCollectAccount}
        onClose={() => setShowCollectAccount(false)}
      />

      <CashClosureModal
        open={showCashClosure}
        onClose={() => setShowCashClosure(false)}
        onCloseCash={handleCashClosure}
        openingAmount={currentShift?.openingAmount || 0}
      />

      <AccessKeyModal
        open={showAccessModal}
        onClose={() => {
          setShowAccessModal(false);
          setPendingAction(null);
        }}
        onSuccess={handleAccessSuccess}
        action={pendingAction?.action || ''}
        title={pendingAction?.action === 'collect-accounts' ? 'Cobrar Cuentas' :
               pendingAction?.action === 'sales-history' ? 'Historial de Ventas' :
               pendingAction?.action === 'delete-line' ? 'Borrar Línea' :
               pendingAction?.action === 'clear-cart' ? 'Limpiar Todo' :
               pendingAction?.action === 'add-customer' ? 'Agregar Cliente' : 'Acción Protegida'}
        validateKey={(key) => validateAccessKey(pendingAction?.action || '', key)}
      />
    </div>
  );
};

export default ModernPosInterface;

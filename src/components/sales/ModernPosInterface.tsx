
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
import QuantityInput from './QuantityInput';
import ShoppingCart from './ShoppingCart';
import { ShoppingCart as ShoppingCartIcon, Trash2, User, Clock, Receipt, BarChart3, UserPlus, DollarSign, Search, Calculator } from 'lucide-react';
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
    validateAccessKey,
    lastAddedProductId
  } = usePos();

  const [showHoldOrders, setShowHoldOrders] = useState(false);
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [showCollectAccount, setShowCollectAccount] = useState(false);
  const [showCashClosure, setShowCashClosure] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{action: string, callback: () => void} | null>(null);

  const selectedCustomerData = selectedCustomer && selectedCustomer !== 'no-customer' 
    ? getCustomer(selectedCustomer) 
    : null;

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }
    onShowPayment();
  };

  // Enhanced keyboard support for quantity modification
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not focused on an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '+') {
        e.preventDefault();
        const inputElement = document.querySelector('[data-barcode-input]') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
          inputElement.value = '+';
          setBarcodeInput('+');
        }
      } else if (e.key === 'Enter' && cart.length > 0) {
        e.preventDefault();
        onShowPayment();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [cart.length, onShowPayment]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = getProduct(productId);
    const minQuantity = product?.allowDecimal || product?.isFractional ? 0.1 : 1;
    
    if (newQuantity < minQuantity) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  // Handle barcode submission with enhanced decimal support
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      processBarcodeCommand(barcodeInput.trim());
      setBarcodeInput('');
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Fixed Header - Barcode Input */}
      <div className="bg-card shadow-sm border-b border-border px-6 py-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="text-2xl font-bold text-yellow-600">
              $ {cartTotal.toFixed(2)}
            </div>
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Código de barras / +cantidad (ej: +2, +0.5)"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-72 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                data-barcode-input
                autoFocus
              />
              <Button type="submit" size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-black-900">Procesar</Button>
            </form>
            <div className="text-sm text-black-400">
              {lastAddedProductId ? (
                <div className="bg-yellow-100 px-3 py-1 rounded border border-yellow-300">
                  <p className="font-medium text-yellow-800">Último producto: {getProduct(lastAddedProductId)?.name}</p>
                  <p className="text-yellow-700">Usa +cantidad para modificar (ej: +2, +0.5)</p>
                </div>
              ) : (
                <div>
                  <p>1. Escanea código de barras</p>
                  <p>2. Usa +cantidad para modificar (ej: +2, +0.5)</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              onClick={handleHoldOrder}
              disabled={cart.length === 0}
            >
              <Clock className="h-4 w-4" />
              DEJAR ABIERTO
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed Search Bar */}
      <div className="bg-card px-6 py-3 border-b border-border flex-shrink-0">
        <CentralProductSearch 
          useWholesalePrices={useWholesalePrices}
          onProductSelect={(product) => {
            console.log('Product selected for detailed view:', product);
          }}
        />
      </div>

      {/* Main Content Area - Fixed Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Shopping Cart Area - Fixed Width */}
        <div className="w-2/3 flex flex-col bg-card min-h-0 border-r border-border">
          {/* Cart Header */}
          <div className="bg-yellow-600 px-6 py-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCartIcon className="h-5 w-5 text-black-900" />
                <span className="font-semibold text-black-900">Carrito de Compras</span>
              </div>
              <Badge variant="secondary" className="bg-black-900 text-yellow-500 border border-yellow-300">
                {cart.length} ítem(s)
              </Badge>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 min-h-0 p-4">
            <ShoppingCart />
          </div>

          {/* Footer Info */}
          <div className="bg-yellow-100 px-6 py-2 border-t border-yellow-300 flex-shrink-0">
            <div className="grid grid-cols-5 gap-4 text-sm text-black-700">
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

          {/* Checkout Button - Always visible */}
          {cart.length > 0 && (
            <div className="p-4 flex-shrink-0 border-t border-border bg-card">
              <Button
                onClick={onShowPayment}
                className="w-full h-12 text-lg font-semibold bg-yellow-600 hover:bg-yellow-700 text-black-900"
              >
                💳 PROCESAR PAGO
              </Button>
            </div>
          )}
        </div>

        {/* Actions Panel - Fixed Width */}
        <div className="w-1/3 bg-card flex flex-col flex-shrink-0 min-h-0">
          {/* Header */}
          <div className="bg-yellow-600 text-black-900 px-4 py-3 text-center flex-shrink-0">
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span className="font-semibold">Acciones</span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Customer Management */}
            <div className="p-4 border-b border-border space-y-3">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
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
            <div className="p-4 border-b border-border space-y-3">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                onClick={() => setShowHoldOrders(true)}
              >
                <Clock className="h-4 w-4" />
                VER PEDIDOS ABIERTOS
              </Button>
              
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                onClick={() => setShowHoldOrders(true)}
              >
                <Search className="h-4 w-4" />
                BUSCAR PEDIDOS
              </Button>
            </div>

            {/* Account Management */}
            <div className="p-4 border-b border-border space-y-3">
              <Button
                variant="outline"
                className="w-full bg-yellow-100 hover:bg-yellow-200 border-yellow-400 text-yellow-800"
                onClick={handleShowCollectAccount}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                COBRAR CUENTAS
              </Button>
            </div>

            {/* Cash Management */}
            <div className="p-4 border-b border-border space-y-3">
              <Button
                variant="outline"
                className="w-full bg-yellow-100 hover:bg-yellow-200 border-yellow-500 text-yellow-800"
                onClick={() => setShowCashClosure(true)}
              >
                <Calculator className="h-4 w-4 mr-2" />
                CUADRE DE CAJAS
              </Button>
            </div>

            {/* Sales History */}
            <div className="p-4 border-b border-border">
              <Button
                className="w-full flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black-900"
                onClick={handleShowHistory}
              >
                <Receipt className="h-4 w-4" />
                HISTORIAL DE VENTAS
              </Button>
            </div>

            {/* Line Actions */}
            <div className="p-4 border-b border-border space-y-3">
              <Button
                variant="outline"
                className="w-full bg-red-100 hover:bg-red-200 border-red-400 text-red-800"
                onClick={handleDeleteLine}
              >
                🗑️ BORRAR LÍNEA
              </Button>
              
              <Button
                variant="outline"
                className="w-full bg-red-100 hover:bg-red-200 border-red-400 text-red-800"
                onClick={handleClearCart}
              >
                🧹 LIMPIAR TODO
              </Button>
            </div>
          </div>
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

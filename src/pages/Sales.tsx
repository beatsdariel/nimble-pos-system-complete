
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ModernPosInterface from '@/components/sales/ModernPosInterface';
import PaymentModal from '@/components/sales/PaymentModal';
import SalesHistory from '@/components/sales/SalesHistory';
import ShiftSelectionModal from '@/components/cash/ShiftSelectionModal';
import CashClosureModal from '@/components/cash/CashClosureModal';
import { usePos } from '@/contexts/PosContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Calculator, Calendar, LogOut, BarChart3, Users, Package, Settings, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Sales = () => {
  const { cart, cartTotal, customers, currentShift, setCurrentShift } = usePos();
  const { currentUser, logout } = useAuth();
  const { businessSettings } = useSettings();
  const location = useLocation();
  const [showPayment, setShowPayment] = useState(false);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [showShiftSelection, setShowShiftSelection] = useState(false);
  const [showCashClosure, setShowCashClosure] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('no-customer');
  const [useWholesalePrices, setUseWholesalePrices] = useState(false);
  const [returnData, setReturnData] = useState<{ returnAmount: number, returnId: string } | null>(null);

  // Check if user needs to select shift on component mount
  useEffect(() => {
    setShowShiftSelection(!currentShift);
  }, [currentShift]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }
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
      } else {
        setUseWholesalePrices(false);
      }
    }
  };

  // Handle return selection from sales history
  const handleReturnSelection = (returnAmount: number, returnId: string) => {
    setReturnData({ returnAmount, returnId });
    setShowPayment(true);
  };

  // Handle shift start - Create a proper CashSession object
  const handleStartShift = (shiftId: string, openingAmount: number) => {
    const shiftData = { 
      id: `session-${Date.now()}`,
      userId: currentUser?.id || 'system',
      shiftId, 
      openingAmount, 
      openingTime: new Date().toISOString(),
      closingAmount: undefined,
      closingTime: undefined,
      status: 'open' as const,
      sales: [],
      totalSales: 0,
      totalCash: 0,
      totalCard: 0,
      totalTransfer: 0,
      totalCredit: 0
    };
    setCurrentShift(shiftData);
    setShowShiftSelection(false);
  };

  // Handle cash closure
  const handleCloseCash = (closureData: any) => {
    console.log('Cuadre de caja completado:', closureData);
    setCurrentShift(null);
    setShowCashClosure(false);
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, adminOnly: false },
    { name: 'Ventas', href: '/sales', icon: Package, adminOnly: false },
    { name: 'Inventario', href: '/inventory', icon: Package, adminOnly: true },
    { name: 'Clientes', href: '/customers', icon: Users, adminOnly: true },
    { name: 'Reportes', href: '/reports', icon: BarChart3, adminOnly: true },
    { name: 'Configuración', href: '/settings', icon: Settings, adminOnly: true },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || currentUser?.role === 'admin'
  );

  return (
    <Layout>
      {/* Fixed Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-900">POS System</h1>
            </div>
            
            <nav className="flex items-center gap-1">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCashClosure(true)}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Cuadre de Cajas
            </Button>
            
            {currentUser?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Finalizar Día
              </Button>
            )}

            <div className="text-sm text-gray-600 border-l pl-3">
              <p>Usuario: {currentUser?.name}</p>
              <p>Rol: {currentUser?.role === 'admin' ? 'Administrador' : 'Empleado'}</p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with proper top margin */}
      <div className="pt-20">
        {currentShift ? (
          <>
            <ModernPosInterface
              onShowPayment={handleCheckout}
              onShowHistory={() => setShowSalesHistory(true)}
              selectedCustomer={selectedCustomer}
              onCustomerChange={handleCustomerChange}
              useWholesalePrices={useWholesalePrices}
              onWholesalePriceChange={setUseWholesalePrices}
            />

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

            <CashClosureModal
              open={showCashClosure}
              onClose={() => setShowCashClosure(false)}
              onCloseCash={handleCloseCash}
              openingAmount={currentShift.openingAmount || 0}
            />
          </>
        ) : null}

        <ShiftSelectionModal
          open={showShiftSelection}
          onClose={() => {}}
          onStartShift={handleStartShift}
          currentUser={currentUser}
        />
      </div>
    </Layout>
  );
};

export default Sales;

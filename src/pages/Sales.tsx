
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

const Sales = () => {
  const { cart, cartTotal, customers, currentShift, setCurrentShift } = usePos();
  const { currentUser } = useAuth();
  const { businessSettings } = useSettings();
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

  // Handle shift start
  const handleStartShift = (shiftId: string, openingAmount: number) => {
    const shiftData = { 
      shiftId, 
      openingAmount, 
      startTime: new Date().toISOString(),
      status: 'open'
    };
    setCurrentShift(shiftData);
    setShowShiftSelection(false);
  };

  // Handle cash closure
  const handleCloseCash = (closureData: any) => {
    console.log('Cuadre de caja completado:', closureData);
    // Here you would typically save the closure data and close the shift
    setCurrentShift(null);
    setShowCashClosure(false);
  };

  return (
    <Layout>
      {currentShift ? (
        <>
          <ModernPosInterface
            onShowPayment={handleCheckout}
            onShowHistory={() => setShowSalesHistory(true)}
            selectedCustomer={selectedCustomer}
            onCustomerChange={handleCustomerChange}
            useWholesalePrices={useWholesalePrices}
            onWholesalePriceChange={setUseWholesalePrices}
            businessName={businessSettings?.name || 'Mi Negocio POS'}
            currency={businessSettings?.currency || 'RD$'}
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
    </Layout>
  );
};

export default Sales;

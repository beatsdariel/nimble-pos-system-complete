
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ModernPosInterface from '@/components/sales/ModernPosInterface';
import PaymentModal from '@/components/sales/PaymentModal';
import SalesHistory from '@/components/sales/SalesHistory';
import ShiftSelectionModal from '@/components/cash/ShiftSelectionModal';
import { usePos } from '@/contexts/PosContext';
import { useAuth } from '@/contexts/AuthContext';

const Sales = () => {
  const { cart, cartTotal, customers } = usePos();
  const { currentUser } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [showShiftSelection, setShowShiftSelection] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('no-customer');
  const [useWholesalePrices, setUseWholesalePrices] = useState(false);
  const [returnData, setReturnData] = useState<{ returnAmount: number, returnId: string } | null>(null);
  const [currentShift, setCurrentShift] = useState<{shiftId: string, openingAmount: number} | null>(null);

  // Check if user needs to select shift on component mount
  useEffect(() => {
    // In a real app, this would check if there's an active shift
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
    setCurrentShift({ shiftId, openingAmount });
    setShowShiftSelection(false);
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


import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ModernPosInterface from '@/components/sales/ModernPosInterface';
import PaymentModal from '@/components/sales/PaymentModal';
import SalesHistory from '@/components/sales/SalesHistory';
import { usePos } from '@/contexts/PosContext';

const Sales = () => {
  const { cart, cartTotal, customers } = usePos();
  const [showPayment, setShowPayment] = useState(false);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('no-customer');
  const [useWholesalePrices, setUseWholesalePrices] = useState(false);
  const [returnData, setReturnData] = useState<{ returnAmount: number, returnId: string } | null>(null);

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

  return (
    <Layout>
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
    </Layout>
  );
};

export default Sales;

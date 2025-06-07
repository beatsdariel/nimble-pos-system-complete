
import React from 'react';
import { Sale, Customer } from '@/types/pos';
import InvoicePrint from './InvoicePrint';

interface ReturnInvoiceProps {
  sale: Sale;
  customer?: Customer;
  returnAmount: number;
  returnItems: any[];
  returnReason: string;
  onPrint: () => void;
}

const ReturnInvoice: React.FC<ReturnInvoiceProps> = ({
  sale,
  customer,
  returnAmount,
  returnItems,
  returnReason,
  onPrint
}) => {
  const returnData = {
    returnAmount,
    returnId: `DEV-${Date.now()}`,
    returnItems,
    returnReason
  };

  return (
    <InvoicePrint
      sale={sale}
      customer={customer}
      onPrint={onPrint}
      type="return"
      returnData={returnData}
    />
  );
};

export default ReturnInvoice;

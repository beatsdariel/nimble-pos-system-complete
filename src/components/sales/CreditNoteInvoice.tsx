
import React from 'react';
import { Sale, Customer } from '@/types/pos';
import InvoicePrint from './InvoicePrint';

interface CreditNoteInvoiceProps {
  sale: Sale;
  customer?: Customer;
  creditAmount: number;
  creditReason: string;
  onPrint: () => void;
}

const CreditNoteInvoice: React.FC<CreditNoteInvoiceProps> = ({
  sale,
  customer,
  creditAmount,
  creditReason,
  onPrint
}) => {
  const returnData = {
    returnAmount: creditAmount,
    returnId: `CN-${Date.now()}`,
    returnReason: creditReason
  };

  return (
    <InvoicePrint
      sale={sale}
      customer={customer}
      onPrint={onPrint}
      type="credit-note"
      returnData={returnData}
    />
  );
};

export default CreditNoteInvoice;

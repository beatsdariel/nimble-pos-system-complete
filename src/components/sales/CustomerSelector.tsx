
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/types/pos';

interface CustomerSelectorProps {
  selectedCustomer: string;
  onCustomerChange: (customerId: string) => void;
  customers: Customer[];
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomer,
  onCustomerChange,
  customers
}) => {
  return (
    <Select value={selectedCustomer} onValueChange={onCustomerChange}>
      <SelectTrigger>
        <SelectValue placeholder="Seleccionar cliente" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="no-customer">Cliente General</SelectItem>
        {customers.map((customer) => (
          <SelectItem key={customer.id} value={customer.id}>
            {customer.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomerSelector;

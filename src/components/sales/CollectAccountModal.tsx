
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { DollarSign, CreditCard, User, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CollectAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const CollectAccountModal: React.FC<CollectAccountModalProps> = ({
  open,
  onClose
}) => {
  const { customers, sales, updateCreditSale } = usePos();
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [cardReference, setCardReference] = useState<string>('');

  // Get customers with credit balance
  const customersWithCredit = customers.filter(customer => 
    (customer.creditBalance || 0) > 0
  );

  const selectedCustomerData = selectedCustomer ? 
    customers.find(c => c.id === selectedCustomer) : null;

  // Get credit sales for selected customer
  const customerCreditSales = selectedCustomer ? 
    sales.filter(sale => 
      sale.customerId === selectedCustomer && 
      sale.status === 'credit'
    ) : [];

  const handlePayment = () => {
    if (!selectedCustomer) {
      toast.error('Debe seleccionar un cliente');
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Debe ingresar un monto válido');
      return;
    }

    const amount = parseFloat(paymentAmount);
    const customerBalance = selectedCustomerData?.creditBalance || 0;

    if (amount > customerBalance) {
      toast.error('El monto excede el balance del cliente');
      return;
    }

    // Find the oldest credit sale to apply payment
    const oldestCreditSale = customerCreditSales
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    if (oldestCreditSale) {
      const paymentMethodData = {
        type: paymentMethod,
        amount: amount,
        reference: paymentMethod === 'card' ? cardReference : undefined
      };

      updateCreditSale(oldestCreditSale.id, amount, paymentMethodData);
      
      toast.success(`Pago de RD$ ${amount.toLocaleString()} registrado exitosamente`);
      
      // Reset form
      setPaymentAmount('');
      setCardReference('');
      setSelectedCustomer('');
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-DO');
  };

  const getDaysOverdue = (dueDate?: string) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cobrar Cuentas por Cobrar
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Form */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registrar Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Selection */}
                <div>
                  <Label htmlFor="customer">Cliente</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente con crédito" />
                    </SelectTrigger>
                    <SelectContent>
                      {customersWithCredit.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{customer.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              RD$ {(customer.creditBalance || 0).toLocaleString()}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Amount */}
                <div>
                  <Label htmlFor="amount">Monto a Pagar</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    max={selectedCustomerData?.creditBalance || 0}
                  />
                  {selectedCustomerData && (
                    <p className="text-sm text-gray-500 mt-1">
                      Balance disponible: RD$ {(selectedCustomerData.creditBalance || 0).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <Label htmlFor="payment-method">Método de Pago</Label>
                  <Select value={paymentMethod} onValueChange={(value: 'cash' | 'card' | 'transfer') => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Efectivo
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Tarjeta
                        </div>
                      </SelectItem>
                      <SelectItem value="transfer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Transferencia
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Card Reference (if card payment) */}
                {paymentMethod === 'card' && (
                  <div>
                    <Label htmlFor="card-reference">Referencia de Tarjeta</Label>
                    <Input
                      id="card-reference"
                      placeholder="Número de autorización"
                      value={cardReference}
                      onChange={(e) => setCardReference(e.target.value)}
                    />
                  </div>
                )}

                {/* Payment Button */}
                <Button 
                  onClick={handlePayment} 
                  className="w-full"
                  disabled={!selectedCustomer || !paymentAmount}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Registrar Pago
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Customer Credit Details */}
          <div className="space-y-4">
            {selectedCustomerData ? (
              <>
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {selectedCustomerData.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Límite de Crédito:</span>
                        <p className="font-medium">RD$ {(selectedCustomerData.creditLimit || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Balance Actual:</span>
                        <p className="font-medium text-red-600">RD$ {(selectedCustomerData.creditBalance || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Crédito Disponible:</span>
                        <p className="font-medium text-green-600">
                          RD$ {((selectedCustomerData.creditLimit || 0) - (selectedCustomerData.creditBalance || 0)).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Facturas Pendientes:</span>
                        <p className="font-medium">{customerCreditSales.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Credit Sales */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Facturas Pendientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {customerCreditSales.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay facturas pendientes</p>
                      ) : (
                        customerCreditSales.map(sale => {
                          const daysOverdue = getDaysOverdue(sale.dueDate);
                          return (
                            <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium">{sale.receiptNumber}</p>
                                <p className="text-sm text-gray-600">
                                  {formatDate(sale.date)}
                                  {sale.dueDate && (
                                    <span className="ml-2">
                                      Vence: {formatDate(sale.dueDate)}
                                    </span>
                                  )}
                                </p>
                                {daysOverdue > 0 && (
                                  <Badge variant="destructive" className="text-xs mt-1">
                                    {daysOverdue} días vencida
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">RD$ {sale.total.toLocaleString()}</p>
                                <p className="text-sm text-gray-600">
                                  Pagado: RD$ {sale.payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Seleccione un cliente para ver los detalles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollectAccountModal;

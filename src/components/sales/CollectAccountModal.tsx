
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { DollarSign, Calendar, User, CreditCard, Search } from 'lucide-react';
import { PaymentMethod } from '@/types/pos';
import { toast } from 'sonner';

interface CollectAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const CollectAccountModal: React.FC<CollectAccountModalProps> = ({ open, onClose }) => {
  const { customers, getCreditSales, updateCreditSale } = usePos();
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedSale, setSelectedSale] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'cash' | 'card'>('cash');
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | 'discover' | 'other'>('visa');
  const [reference, setReference] = useState<string>('');

  const customer = customers.find(c => c.id === selectedCustomer);
  const creditSales = selectedCustomer ? getCreditSales(selectedCustomer) : [];
  const selectedSaleData = creditSales.find(s => s.id === selectedSale);

  const handlePayment = () => {
    if (!selectedCustomer || !selectedSale || !paymentAmount) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      toast.error('El monto debe ser mayor a cero');
      return;
    }

    if (selectedSaleData && amount > selectedSaleData.total) {
      toast.error('El monto no puede ser mayor al total de la venta');
      return;
    }

    const payment: PaymentMethod = {
      type: paymentType,
      amount,
      reference: reference || undefined,
      ...(paymentType === 'card' && { cardType })
    };

    updateCreditSale(selectedSale, amount, payment);
    toast.success('Pago procesado exitosamente');
    
    // Reset form
    setSelectedCustomer('');
    setSelectedSale('');
    setPaymentAmount('');
    setReference('');
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-DO');
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cobrar Cuentas por Cobrar
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Selección de Cliente y Venta */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer">Cliente</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers
                    .filter(c => (c.creditBalance || 0) > 0)
                    .map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{customer.name}</span>
                          <span className="text-sm text-red-600 ml-2">
                            RD$ {(customer.creditBalance || 0).toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {customer && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Límite de Crédito:</span>
                    <span className="font-medium">RD$ {(customer.creditLimit || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance Actual:</span>
                    <span className="font-medium text-red-600">
                      RD$ {(customer.creditBalance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disponible:</span>
                    <span className="font-medium text-green-600">
                      RD$ {((customer.creditLimit || 0) - (customer.creditBalance || 0)).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {creditSales.length > 0 && (
              <div>
                <Label>Ventas a Crédito</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {creditSales.map(sale => {
                    const daysOverdue = sale.dueDate ? getDaysOverdue(sale.dueDate) : 0;
                    return (
                      <Card 
                        key={sale.id}
                        className={`cursor-pointer transition-colors ${
                          selectedSale === sale.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedSale(sale.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-sm">{sale.receiptNumber}</div>
                              <div className="text-xs text-gray-500">
                                {formatDate(sale.date)}
                              </div>
                              {sale.dueDate && (
                                <div className="text-xs">
                                  Vence: {formatDate(sale.dueDate)}
                                  {daysOverdue > 0 && (
                                    <Badge variant="destructive" className="ml-1 text-xs">
                                      {daysOverdue} días
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-sm">
                                RD$ {sale.total.toLocaleString()}
                              </div>
                              <Badge variant={sale.status === 'credit' ? 'destructive' : 'secondary'}>
                                {sale.status === 'credit' ? 'Pendiente' : 'Pagado'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Procesamiento de Pago */}
          <div className="space-y-4">
            {selectedSaleData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Detalles de la Venta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Recibo:</span>
                    <span className="font-medium">{selectedSaleData.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">RD$ {selectedSaleData.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pagado:</span>
                    <span className="font-medium text-green-600">
                      RD$ {selectedSaleData.payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Pendiente:</span>
                    <span className="font-semibold text-red-600">
                      RD$ {(selectedSaleData.total - selectedSaleData.payments.reduce((sum, p) => sum + p.amount, 0)).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label htmlFor="payment-amount">Monto a Pagar</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="payment-type">Método de Pago</Label>
              <Select value={paymentType} onValueChange={(value: 'cash' | 'card') => setPaymentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentType === 'card' && (
              <>
                <div>
                  <Label htmlFor="card-type">Tipo de Tarjeta</Label>
                  <Select value={cardType} onValueChange={(value: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other') => setCardType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="amex">American Express</SelectItem>
                      <SelectItem value="discover">Discover</SelectItem>
                      <SelectItem value="other">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reference">Referencia</Label>
                  <Input
                    id="reference"
                    placeholder="Número de autorización"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={!selectedCustomer || !selectedSale || !paymentAmount}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Procesar Pago
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollectAccountModal;

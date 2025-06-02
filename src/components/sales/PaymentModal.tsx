
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePos } from '@/contexts/PosContext';
import { PaymentMethod } from '@/types/pos';
import { CreditCard, DollarSign, Banknote, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose }) => {
  const { cart, cartTotal, cartSubtotal, cartTax, completeSale, currentUser } = usePos();
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<string>('');
  const [cardReference, setCardReference] = useState<string>('');

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = cartTotal - totalPaid;
  const change = totalPaid > cartTotal ? totalPaid - cartTotal : 0;

  const addPayment = (payment: PaymentMethod) => {
    setPayments(prev => [...prev, payment]);
  };

  const handleCashPayment = () => {
    const amount = parseFloat(cashAmount);
    if (amount > 0) {
      addPayment({ type: 'cash', amount });
      setCashAmount('');
    }
  };

  const handleCardPayment = () => {
    const amount = parseFloat(cardAmount);
    if (amount > 0) {
      addPayment({ 
        type: 'card', 
        amount, 
        reference: cardReference || `CARD-${Date.now()}` 
      });
      setCardAmount('');
      setCardReference('');
    }
  };

  const completeSaleTransaction = () => {
    if (remaining <= 0 && cart.length > 0 && currentUser) {
      const sale = {
        date: new Date().toISOString(),
        items: [...cart],
        subtotal: cartSubtotal,
        tax: cartTax,
        total: cartTotal,
        payments: [...payments],
        userId: currentUser.id,
        receiptNumber: `REC-${Date.now()}`
      };

      completeSale(sale);
      
      // Reset payment state
      setPayments([]);
      setCashAmount('');
      setCardAmount('');
      setCardReference('');
      
      toast.success('Venta completada exitosamente');
      onClose();
    }
  };

  const resetPayments = () => {
    setPayments([]);
    setCashAmount('');
    setCardAmount('');
    setCardReference('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Procesar Pago
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div>
            <Tabs defaultValue="cash" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cash" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Efectivo
                </TabsTrigger>
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Tarjeta
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="cash" className="space-y-4">
                <div>
                  <Label htmlFor="cash-amount">Monto en Efectivo</Label>
                  <Input
                    id="cash-amount"
                    type="number"
                    placeholder="0.00"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                  />
                </div>
                <Button onClick={handleCashPayment} className="w-full">
                  Agregar Pago en Efectivo
                </Button>
              </TabsContent>
              
              <TabsContent value="card" className="space-y-4">
                <div>
                  <Label htmlFor="card-amount">Monto con Tarjeta</Label>
                  <Input
                    id="card-amount"
                    type="number"
                    placeholder="0.00"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="card-reference">Referencia (Opcional)</Label>
                  <Input
                    id="card-reference"
                    placeholder="Número de autorización"
                    value={cardReference}
                    onChange={(e) => setCardReference(e.target.value)}
                  />
                </div>
                <Button onClick={handleCardPayment} className="w-full">
                  Agregar Pago con Tarjeta
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Payment Summary */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Resumen de Venta</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>RD$ {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ITBIS:</span>
                  <span>RD$ {cartTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>RD$ {cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {payments.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Pagos Registrados</h3>
                <div className="space-y-2 text-sm">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="capitalize">
                        {payment.type === 'cash' ? 'Efectivo' : 'Tarjeta'}:
                      </span>
                      <span>RD$ {payment.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Pagado:</span>
                      <span>RD$ {totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pendiente:</span>
                      <span className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                        RD$ {Math.abs(remaining).toLocaleString()}
                      </span>
                    </div>
                    {change > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Cambio:</span>
                        <span>RD$ {change.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={resetPayments}
                className="flex-1"
              >
                Limpiar
              </Button>
              <Button 
                onClick={completeSaleTransaction}
                disabled={remaining > 0}
                className="flex-1"
              >
                {remaining > 0 ? `Faltan RD$ ${remaining.toLocaleString()}` : 'Completar Venta'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;

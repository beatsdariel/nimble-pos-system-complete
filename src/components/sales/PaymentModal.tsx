
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePos } from '@/contexts/PosContext';
import { PaymentMethod, Customer, Sale } from '@/types/pos';
import { CreditCard, DollarSign, Banknote, Receipt, Zap, Calendar, ArrowLeftCircle } from 'lucide-react';
import { toast } from 'sonner';
import CreditNoteModal from '@/components/returns/CreditNoteModal';
import InvoicePrint from './InvoicePrint';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  selectedCustomer?: Customer | null;
  returnAmount?: number;
  returnId?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  open, 
  onClose, 
  selectedCustomer,
  returnAmount = 0,
  returnId 
}) => {
  const { cart, cartTotal, cartSubtotal, cartTax, completeSale, currentUser, customers } = usePos();
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<string>('');
  const [cardReference, setCardReference] = useState<string>('');
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | 'discover' | 'other'>('visa');
  const [useCredit, setUseCredit] = useState<boolean>(false);
  const [returnPayment, setReturnPayment] = useState<boolean>(returnAmount > 0);
  const [showCreditNotes, setShowCreditNotes] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Calculate totals considering return amount
  const totalAfterReturn = Math.max(0, cartTotal - returnAmount);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = totalAfterReturn - totalPaid;
  const change = totalPaid > totalAfterReturn ? totalPaid - totalAfterReturn : 0;

  // Reset payment state when the modal is opened/closed
  useEffect(() => {
    if (open) {
      setPayments([]);
      setCashAmount('');
      setCardAmount('');
      setCardReference('');
      setCardType('visa');
      setUseCredit(false);
      
      if (returnAmount > 0 && returnId) {
        // Automatically apply return amount as payment
        setReturnPayment(true);
        setPayments([{ 
          type: 'return',
          amount: Math.min(returnAmount, cartTotal),
          returnId
        }]);
      }
    }
  }, [open, returnAmount, returnId, cartTotal]);

  const addPayment = (payment: PaymentMethod) => {
    setPayments(prev => [...prev, payment]);
  };

  const resetPayments = () => {
    setPayments([]);
    setCashAmount('');
    setCardAmount('');
    setCardReference('');
    setCardType('visa');
    setUseCredit(false);
    setReturnPayment(false);
  };

  const handleExactCashPayment = () => {
    if (remaining > 0) {
      addPayment({ type: 'cash', amount: remaining });
      setCashAmount('');
    }
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
        reference: cardReference || `CARD-${Date.now()}`,
        cardType 
      });
      setCardAmount('');
      setCardReference('');
    }
  };

  const handleCreditPayment = () => {
    if (!selectedCustomer) {
      toast.error('Debe seleccionar un cliente para ventas a crédito');
      return;
    }
    
    const creditLimit = selectedCustomer.creditLimit || 0;
    const currentBalance = selectedCustomer.creditBalance || 0;
    const availableCredit = creditLimit - currentBalance;
    
    if (availableCredit <= 0) {
      toast.error('El cliente no tiene crédito disponible');
      return;
    }
    
    if (remaining > availableCredit) {
      toast.error(`El monto excede el crédito disponible (RD$ ${availableCredit.toLocaleString()})`);
      return;
    }
    
    if (remaining > 0) {
      addPayment({ type: 'credit', amount: remaining });
      setUseCredit(true);
    }
  };

  const handleCreditNotePayment = (creditNote: any, amountToUse: number) => {
    if (amountToUse > 0) {
      addPayment({ 
        type: 'credit-note', 
        amount: amountToUse,
        creditNoteId: creditNote.id 
      });
    }
  };

  const completeSaleTransaction = () => {
    if (!currentUser) return;

    // Calculate final total and payments
    const finalTotal = cartTotal - returnAmount;
    const finalPayments = payments.map(payment => ({
      ...payment,
      amount: payment.type === 'return' ? payment.amount : payment.amount
    }));

    const isCreditSale = finalPayments.some(p => p.type === 'credit');
    const creditDays = isCreditSale ? 30 : 0;

    const saleData: Omit<Sale, 'id'> = {
      date: new Date().toISOString(),
      items: cart,
      subtotal: cartSubtotal,
      tax: cartTax,
      total: finalTotal,
      payments: finalPayments,
      customerId: selectedCustomer?.id,
      userId: currentUser.id,
      receiptNumber: `REC-${Date.now()}`,
      status: isCreditSale ? 'credit' : 'completed',
      ...(isCreditSale && selectedCustomer && {
        dueDate: new Date(Date.now() + (creditDays * 24 * 60 * 60 * 1000)).toISOString()
      })
    };

    const sale = completeSale(saleData);
    
    if (sale) {
      setCompletedSale(sale);
      toast.success('Venta procesada exitosamente');
      
      // Don't close modal immediately - wait for print completion
      setTimeout(() => {
        handleClose();
      }, 1000);
    }
  };

  const handlePrintComplete = () => {
    setCompletedSale(null);
  };

  const handleClose = () => {
    // Reset payment state
    setCompletedSale(null);
    setPayments([]);
    setCashAmount('');
    setCardAmount('');
    setCardReference('');
    setCardType('visa');
    setUseCredit(false);
    setReturnPayment(false);
    onClose();
  };

  // Determine if credit payment is available
  const isCreditAvailable = selectedCustomer && 
    (selectedCustomer.creditLimit || 0) > 0 &&
    ((selectedCustomer.creditBalance || 0) < (selectedCustomer.creditLimit || 0));

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl">
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="cash" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Efectivo
                  </TabsTrigger>
                  <TabsTrigger value="card" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Tarjeta
                  </TabsTrigger>
                  <TabsTrigger 
                    value="credit" 
                    className="flex items-center gap-2"
                    disabled={!isCreditAvailable}
                  >
                    <Calendar className="h-4 w-4" />
                    Crédito
                  </TabsTrigger>
                  <TabsTrigger 
                    value="credit-note" 
                    className="flex items-center gap-2"
                    disabled={!selectedCustomer}
                  >
                    <CreditCard className="h-4 w-4" />
                    Nota
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
                  <div className="flex gap-2">
                    <Button onClick={handleCashPayment} className="flex-1">
                      <Banknote className="h-4 w-4 mr-2" />
                      Agregar Pago
                    </Button>
                    {remaining > 0 && (
                      <Button 
                        onClick={handleExactCashPayment} 
                        variant="outline"
                        className="flex-1"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Pago Exacto
                      </Button>
                    )}
                  </div>
                  {remaining > 0 && (
                    <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                      💡 <strong>Pago exacto:</strong> RD$ {remaining.toLocaleString()}
                    </div>
                  )}
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
                
                <TabsContent value="credit" className="space-y-4">
                  {selectedCustomer ? (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Información de Crédito</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Límite de Crédito</p>
                            <p className="font-medium">RD$ {(selectedCustomer.creditLimit || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Balance Actual</p>
                            <p className="font-medium">RD$ {(selectedCustomer.creditBalance || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Disponible</p>
                            <p className="font-medium text-green-600">
                              RD$ {((selectedCustomer.creditLimit || 0) - (selectedCustomer.creditBalance || 0)).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">A Pagar</p>
                            <p className="font-medium text-red-600">RD$ {remaining.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <Button 
                          onClick={handleCreditPayment} 
                          className="w-full"
                          disabled={useCredit || remaining <= 0}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Usar Crédito
                        </Button>
                      </div>
                      
                      <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                        🕑 La fecha de vencimiento será en 30 días
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Debe seleccionar un cliente para usar crédito</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="credit-note" className="space-y-4">
                  {selectedCustomer ? (
                    <>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Notas de Crédito</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Use las notas de crédito disponibles del cliente para este pago
                        </p>
                        <Button 
                          onClick={() => setShowCreditNotes(true)}
                          className="w-full"
                          variant="outline"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Ver Notas de Crédito Disponibles
                        </Button>
                      </div>
                      
                      <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        💡 Las notas de crédito se aplicarán automáticamente al monto pendiente
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Debe seleccionar un cliente para usar notas de crédito</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Payment Summary */}
            <div className="space-y-4">
              {/* Customer Info */}
              {selectedCustomer && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Cliente</h3>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{selectedCustomer.name}</p>
                    {selectedCustomer.document && (
                      <p className="text-gray-600">{selectedCustomer.document}</p>
                    )}
                    {selectedCustomer.email && (
                      <p className="text-gray-600">{selectedCustomer.email}</p>
                    )}
                  </div>
                </div>
              )}

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
                  
                  {returnAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Devolución:</span>
                      <span>- RD$ {returnAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {returnAmount > 0 && (
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>A Pagar:</span>
                      <span>RD$ {totalAfterReturn.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {payments.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Pagos Registrados</h3>
                  <div className="space-y-2 text-sm">
                    {payments.map((payment, index) => {
                      let paymentMethod = "";
                      switch(payment.type) {
                        case 'cash': paymentMethod = "Efectivo"; break;
                        case 'card': paymentMethod = `Tarjeta ${payment.cardType ? `(${payment.cardType.toUpperCase()})` : ''}`; break;
                        case 'credit': paymentMethod = "Crédito"; break;
                        case 'return': paymentMethod = "Devolución"; break;
                        case 'credit-note': paymentMethod = "Nota de Crédito"; break;
                        default: paymentMethod = payment.type;
                      }
                      
                      return (
                        <div key={index} className="flex justify-between">
                          <span className="capitalize">
                            {paymentMethod}:
                            {payment.creditNoteId && ` (${payment.creditNoteId})`}
                          </span>
                          <span>RD$ {payment.amount.toLocaleString()}</span>
                        </div>
                      );
                    })}
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
        
        <CreditNoteModal
          open={showCreditNotes}
          onClose={() => setShowCreditNotes(false)}
          customerId={selectedCustomer?.id}
          onSelectCreditNote={(creditNote) => {
            const amountToUse = Math.min(creditNote.balance, remaining);
            handleCreditNotePayment(creditNote, amountToUse);
          }}
        />
      </Dialog>

      {/* Auto-print invoice when sale is completed */}
      {completedSale && (
        <InvoicePrint
          sale={completedSale}
          customer={selectedCustomer || undefined}
          onPrint={handlePrintComplete}
        />
      )}
    </>
  );
};

export default PaymentModal;

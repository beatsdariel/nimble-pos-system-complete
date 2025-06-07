
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePos } from '@/contexts/PosContext';
import CashCountModal from './CashCountModal';
import { Calculator, DollarSign, Receipt, CreditCard, ArrowRightLeft } from 'lucide-react';
import { CashCount } from '@/types/pos';
import { toast } from 'sonner';

interface CashClosureModalProps {
  open: boolean;
  onClose: () => void;
  onCloseCash: (data: any) => void;
  openingAmount: number;
}

const CashClosureModal: React.FC<CashClosureModalProps> = ({
  open,
  onClose,
  onCloseCash,
  openingAmount
}) => {
  const { sales } = usePos();
  const [showCashCount, setShowCashCount] = useState(false);

  // Calcular ventas del día
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(sale => sale.date.startsWith(today));
  
  const cashSales = todaySales.reduce((sum, sale) => {
    return sum + sale.payments.filter(p => p.type === 'cash').reduce((s, p) => s + p.amount, 0);
  }, 0);

  const cardSales = todaySales.reduce((sum, sale) => {
    return sum + sale.payments.filter(p => p.type === 'card').reduce((s, p) => s + p.amount, 0);
  }, 0);

  const transferSales = todaySales.reduce((sum, sale) => {
    return sum + sale.payments.filter(p => p.type === 'transfer').reduce((s, p) => s + p.amount, 0);
  }, 0);

  const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const expectedCash = openingAmount + cashSales;

  const expectedAmounts = {
    cash: expectedCash,
    card: cardSales,
    transfer: transferSales
  };

  const handleCashCount = (count: CashCount) => {
    const cashDifference = count.cash - expectedCash;
    const cardDifference = count.card - cardSales;
    const transferDifference = count.transfer - transferSales;

    const closureData = {
      date: new Date().toISOString(),
      openingAmount,
      expectedCash,
      actualCash: count.cash,
      expectedCard: cardSales,
      actualCard: count.card,
      expectedTransfer: transferSales,
      actualTransfer: count.transfer,
      cashDifference,
      cardDifference,
      transferDifference,
      totalSales,
      cashSales,
      cardSales,
      transferSales,
      transactionCount: todaySales.length,
      notes: count.notes
    };

    onCloseCash(closureData);
    setShowCashCount(false);
    toast.success('Cuadre de caja realizado exitosamente');
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cuadre de Caja
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen del Día</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total de ventas:</span>
                  <span className="font-semibold">RD$ {totalSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transacciones:</span>
                  <span className="font-semibold">{todaySales.length}</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Efectivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Apertura:</span>
                      <span>RD$ {openingAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ventas:</span>
                      <span>RD$ {cashSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Esperado:</span>
                      <span>RD$ {expectedCash.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    Tarjetas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Ventas:</span>
                      <span>RD$ {cardSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Esperado:</span>
                      <span>RD$ {cardSales.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ArrowRightLeft className="h-4 w-4 text-purple-600" />
                    Transferencias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Ventas:</span>
                      <span>RD$ {transferSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Esperado:</span>
                      <span>RD$ {transferSales.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => setShowCashCount(true)} className="flex-1">
                <Receipt className="h-4 w-4 mr-2" />
                Realizar Conteo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CashCountModal
        open={showCashCount}
        onClose={() => setShowCashCount(false)}
        onSubmitCount={handleCashCount}
        expectedAmounts={expectedAmounts}
        openingAmount={openingAmount}
      />
    </>
  );
};

export default CashClosureModal;

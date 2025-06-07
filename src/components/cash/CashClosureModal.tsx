
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePos } from '@/contexts/PosContext';
import { Calculator, DollarSign, Receipt, Printer } from 'lucide-react';
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
  const [actualCash, setActualCash] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Calcular ventas del día
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(sale => sale.date.startsWith(today));
  
  const cashSales = todaySales.reduce((sum, sale) => {
    return sum + sale.payments.filter(p => p.type === 'cash').reduce((s, p) => s + p.amount, 0);
  }, 0);

  const cardSales = todaySales.reduce((sum, sale) => {
    return sum + sale.payments.filter(p => p.type === 'card').reduce((s, p) => s + p.amount, 0);
  }, 0);

  const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const expectedCash = openingAmount + cashSales;
  const actualCashAmount = parseFloat(actualCash) || 0;
  const difference = actualCashAmount - expectedCash;

  const handleCloseCash = () => {
    if (!actualCash) {
      toast.error('Debe ingresar el monto actual en caja');
      return;
    }

    const closureData = {
      date: new Date().toISOString(),
      openingAmount,
      expectedCash,
      actualCash: actualCashAmount,
      difference,
      totalSales,
      cashSales,
      cardSales,
      transactionCount: todaySales.length,
      notes
    };

    onCloseCash(closureData);
    printClosure(closureData);
    toast.success('Cuadre de caja realizado exitosamente');
    onClose();
  };

  const printClosure = (data: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>Cuadre de Caja</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            .flex { display: flex; justify-content: space-between; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CUADRE DE CAJA</h1>
            <p>Fecha: ${new Date(data.date).toLocaleString()}</p>
          </div>
          
          <div class="section">
            <h3>RESUMEN DE VENTAS</h3>
            <div class="flex"><span>Total de ventas:</span><span>RD$ ${data.totalSales.toLocaleString()}</span></div>
            <div class="flex"><span>Ventas en efectivo:</span><span>RD$ ${data.cashSales.toLocaleString()}</span></div>
            <div class="flex"><span>Ventas con tarjeta:</span><span>RD$ ${data.cardSales.toLocaleString()}</span></div>
            <div class="flex"><span>Transacciones:</span><span>${data.transactionCount}</span></div>
          </div>
          
          <div class="section">
            <h3>CONTEO DE EFECTIVO</h3>
            <div class="flex"><span>Apertura de caja:</span><span>RD$ ${data.openingAmount.toLocaleString()}</span></div>
            <div class="flex"><span>Efectivo esperado:</span><span>RD$ ${data.expectedCash.toLocaleString()}</span></div>
            <div class="flex"><span>Efectivo actual:</span><span>RD$ ${data.actualCash.toLocaleString()}</span></div>
            <div class="flex total"><span>Diferencia:</span><span style="color: ${data.difference >= 0 ? 'green' : 'red'}">RD$ ${data.difference.toLocaleString()}</span></div>
          </div>
          
          ${data.notes ? `<div class="section"><strong>Observaciones:</strong> ${data.notes}</div>` : ''}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
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
                <span>Ventas en efectivo:</span>
                <span className="font-semibold">RD$ {cashSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Ventas con tarjeta:</span>
                <span className="font-semibold">RD$ {cardSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Transacciones:</span>
                <span className="font-semibold">{todaySales.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conteo de Efectivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Apertura de caja:</span>
                  <div className="font-semibold text-lg">RD$ {openingAmount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Efectivo esperado:</span>
                  <div className="font-semibold text-lg">RD$ {expectedCash.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <Label htmlFor="actual-cash">Efectivo actual en caja</Label>
                <Input
                  id="actual-cash"
                  type="number"
                  placeholder="0.00"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              {actualCash && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Diferencia:</span>
                    <span className={`font-bold text-lg ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {difference >= 0 ? '+' : ''}RD$ {difference.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {difference === 0 ? 'Cuadre perfecto' : difference > 0 ? 'Sobrante en caja' : 'Faltante en caja'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <Label htmlFor="notes">Observaciones (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleCloseCash} disabled={!actualCash} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Realizar Cuadre
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CashClosureModal;

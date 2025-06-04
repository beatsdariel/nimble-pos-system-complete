
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { usePos } from '@/contexts/PosContext';
import { toast } from '@/hooks/use-toast';
import { Calculator, DollarSign, Receipt, Printer, CreditCard } from 'lucide-react';

interface CashClosureModalProps {
  open: boolean;
  onClose: () => void;
}

interface BillCount {
  denomination: number;
  count: number;
}

interface CardCount {
  type: string;
  count: number;
  amount: number;
}

const CashClosureModal: React.FC<CashClosureModalProps> = ({ open, onClose }) => {
  const { currentUser, currentSession, createCashClosure, getSessionSales, getSessionExpenses, getExpectedCash } = useAuth();
  const { sales } = usePos();
  const [notes, setNotes] = useState('');

  // Conteo de billetes
  const [billCounts, setBillCounts] = useState<BillCount[]>([
    { denomination: 1, count: 0 },
    { denomination: 5, count: 0 },
    { denomination: 10, count: 0 },
    { denomination: 25, count: 0 },
    { denomination: 50, count: 0 },
    { denomination: 100, count: 0 },
    { denomination: 200, count: 0 },
    { denomination: 500, count: 0 },
    { denomination: 1000, count: 0 },
    { denomination: 2000, count: 0 }
  ]);

  // Conteo de tarjetas
  const [cardCounts, setCardCounts] = useState<CardCount[]>([
    { type: 'Visa', count: 0, amount: 0 },
    { type: 'Mastercard', count: 0, amount: 0 },
    { type: 'American Express', count: 0, amount: 0 },
    { type: 'Otras Tarjetas', count: 0, amount: 0 }
  ]);

  const sessionSales = getSessionSales();
  const sessionExpenses = getSessionExpenses();
  const expectedCash = getExpectedCash();
  
  // Calcular efectivo contado basado en billetes
  const countedCash = billCounts.reduce((sum, bill) => sum + (bill.denomination * bill.count), 0);
  
  // Calcular total de tarjetas
  const totalCards = cardCounts.reduce((sum, card) => sum + card.amount, 0);
  
  const difference = countedCash - expectedCash;

  // Contar ventas de la sesión actual
  const sessionSalesCount = sales.filter(sale => 
    currentSession && new Date(sale.date) >= new Date(currentSession.startTime)
  ).length;

  const updateBillCount = (denomination: number, count: number) => {
    setBillCounts(prev => prev.map(bill => 
      bill.denomination === denomination ? { ...bill, count: Math.max(0, count) } : bill
    ));
  };

  const updateCardCount = (type: string, field: 'count' | 'amount', value: number) => {
    setCardCounts(prev => prev.map(card => 
      card.type === type ? { ...card, [field]: Math.max(0, value) } : card
    ));
  };

  const printClosure = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const closureData = {
      date: new Date().toLocaleString(),
      user: currentUser?.name,
      sessionStart: currentSession?.startTime ? new Date(currentSession.startTime).toLocaleString() : '',
      sessionEnd: new Date().toLocaleString(),
      salesCount: sessionSalesCount,
      totalSales: sessionSales,
      expenses: sessionExpenses,
      expectedCash,
      countedCash,
      totalCards,
      difference,
      billCounts: billCounts.filter(bill => bill.count > 0),
      cardCounts: cardCounts.filter(card => card.count > 0 || card.amount > 0),
      notes
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cierre de Caja</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            .flex { display: flex; justify-content: space-between; }
            .bill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .total { font-weight: bold; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CIERRE DE CAJA</h1>
            <p>Fecha: ${closureData.date}</p>
            <p>Usuario: ${closureData.user}</p>
          </div>

          <div class="section">
            <h3>RESUMEN DE TURNO</h3>
            <div class="flex"><span>Inicio de turno:</span><span>${closureData.sessionStart}</span></div>
            <div class="flex"><span>Fin de turno:</span><span>${closureData.sessionEnd}</span></div>
            <div class="flex"><span>Ventas realizadas:</span><span>${closureData.salesCount}</span></div>
            <div class="flex"><span>Total en ventas:</span><span>RD$ ${closureData.totalSales.toLocaleString()}</span></div>
            <div class="flex"><span>Gastos:</span><span>RD$ ${closureData.expenses.toLocaleString()}</span></div>
          </div>

          <div class="section">
            <h3>CONTEO DE EFECTIVO</h3>
            <table>
              <tr><th>Denominación</th><th>Cantidad</th><th>Total</th></tr>
              ${closureData.billCounts.map(bill => 
                `<tr><td>RD$ ${bill.denomination}</td><td>${bill.count}</td><td>RD$ ${(bill.denomination * bill.count).toLocaleString()}</td></tr>`
              ).join('')}
              <tr class="total"><td colspan="2">TOTAL EFECTIVO</td><td>RD$ ${closureData.countedCash.toLocaleString()}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>CONTEO DE TARJETAS</h3>
            <table>
              <tr><th>Tipo</th><th>Transacciones</th><th>Monto</th></tr>
              ${closureData.cardCounts.map(card => 
                `<tr><td>${card.type}</td><td>${card.count}</td><td>RD$ ${card.amount.toLocaleString()}</td></tr>`
              ).join('')}
              <tr class="total"><td colspan="2">TOTAL TARJETAS</td><td>RD$ ${closureData.totalCards.toLocaleString()}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>RESUMEN FINAL</h3>
            <div class="flex"><span>Efectivo esperado:</span><span>RD$ ${closureData.expectedCash.toLocaleString()}</span></div>
            <div class="flex"><span>Efectivo contado:</span><span>RD$ ${closureData.countedCash.toLocaleString()}</span></div>
            <div class="flex total"><span>Diferencia:</span><span style="color: ${closureData.difference >= 0 ? 'green' : 'red'}">RD$ ${closureData.difference.toLocaleString()}</span></div>
            ${closureData.notes ? `<div><strong>Observaciones:</strong> ${closureData.notes}</div>` : ''}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const handleCloseCash = () => {
    if (!currentUser || !currentSession) return;

    if (countedCash === 0) {
      toast({
        title: "Error",
        description: "Debe ingresar el conteo de efectivo",
        variant: "destructive",
      });
      return;
    }

    const closure = {
      sessionId: currentSession.startTime,
      userId: currentUser.id,
      startTime: currentSession.startTime,
      endTime: new Date().toISOString(),
      expectedCash,
      countedCash,
      difference,
      salesCount: sessionSalesCount,
      totalSales: sessionSales,
      expenses: sessionExpenses,
      notes: notes || undefined
    };

    createCashClosure(closure);

    toast({
      title: "Cierre de caja realizado",
      description: `Diferencia: RD$ ${difference.toFixed(2)}`,
      variant: difference === 0 ? "default" : "destructive",
    });

    printClosure();
    onClose();
    setNotes('');
    setBillCounts(prev => prev.map(bill => ({ ...bill, count: 0 })));
    setCardCounts(prev => prev.map(card => ({ ...card, count: 0, amount: 0 })));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cierre de Caja Detallado
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen de la sesión */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Resumen de Turno
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Ventas realizadas:</span>
                <span className="font-medium">{sessionSalesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total en ventas:</span>
                <span className="font-medium text-green-600">RD$ {sessionSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Gastos registrados:</span>
                <span className="font-medium text-red-600">RD$ {sessionExpenses.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <span>Efectivo esperado:</span>
                <span className="text-blue-600">RD$ {expectedCash.toLocaleString()}</span>
              </div>
              
              {(countedCash > 0 || totalCards > 0) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Diferencia:</span>
                    <span className={`font-bold ${difference === 0 ? 'text-green-600' : difference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {difference > 0 ? '+' : ''}RD$ {difference.toFixed(2)}
                    </span>
                  </div>
                  {difference !== 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {difference > 0 ? 'Sobrante' : 'Faltante'} en caja
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conteo de efectivo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Conteo de Efectivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm font-medium">
                <span>Denominación</span>
                <span>Cantidad</span>
                <span>Total</span>
              </div>
              {billCounts.map((bill) => (
                <div key={bill.denomination} className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-sm">RD$ {bill.denomination}</span>
                  <Input
                    type="number"
                    min="0"
                    value={bill.count}
                    onChange={(e) => updateBillCount(bill.denomination, parseInt(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                  <span className="text-sm font-medium">
                    RD$ {(bill.denomination * bill.count).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex justify-between font-bold">
                  <span>Total Efectivo:</span>
                  <span className="text-green-600">RD$ {countedCash.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conteo de tarjetas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Conteo de Tarjetas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cardCounts.map((card) => (
                <div key={card.type} className="space-y-2 p-3 border rounded">
                  <div className="font-medium text-sm">{card.type}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Transacciones</Label>
                      <Input
                        type="number"
                        min="0"
                        value={card.count}
                        onChange={(e) => updateCardCount(card.type, 'count', parseInt(e.target.value) || 0)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Monto</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={card.amount}
                        onChange={(e) => updateCardCount(card.type, 'amount', parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex justify-between font-bold">
                  <span>Total Tarjetas:</span>
                  <span className="text-blue-600">RD$ {totalCards.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Observaciones */}
        <div className="mt-6">
          <Label htmlFor="notes">Observaciones (opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Notas adicionales sobre el cierre..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCloseCash} disabled={countedCash === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Realizar Cierre e Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CashClosureModal;

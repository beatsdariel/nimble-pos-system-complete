
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePos } from '@/contexts/PosContext';
import { useSettings } from '@/contexts/SettingsContext';
import { CashCount } from '@/types/pos';
import { Calculator, DollarSign, CreditCard, ArrowRightLeft, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface CashCountModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitCount: (count: CashCount) => void;
  expectedAmounts: {
    cash: number;
    card: number;
    transfer: number;
  };
  openingAmount: number;
}

const CashCountModal: React.FC<CashCountModalProps> = ({
  open,
  onClose,
  onSubmitCount,
  expectedAmounts,
  openingAmount
}) => {
  const { businessSettings } = useSettings();
  const [actualCash, setActualCash] = useState<string>('');
  const [actualCard, setActualCard] = useState<string>('');
  const [actualTransfer, setActualTransfer] = useState<string>('');
  const [notes, setNotes] = useState('');

  const actualCashAmount = parseFloat(actualCash) || 0;
  const actualCardAmount = parseFloat(actualCard) || 0;
  const actualTransferAmount = parseFloat(actualTransfer) || 0;

  // Balance de caja sin apertura (ventas netas del día)
  const cashSalesBalance = expectedAmounts.cash - openingAmount;
  const cashDifference = actualCashAmount - expectedAmounts.cash;
  const cardDifference = actualCardAmount - expectedAmounts.card;
  const transferDifference = actualTransferAmount - expectedAmounts.transfer;

  // Balance total de ventas (sin apertura)
  const totalSalesBalance = cashSalesBalance + expectedAmounts.card + expectedAmounts.transfer;
  const totalActualBalance = (actualCashAmount - openingAmount) + actualCardAmount + actualTransferAmount;
  const totalDifference = totalActualBalance - totalSalesBalance;

  const currency = businessSettings?.currency || 'RD$';

  const handleSubmit = () => {
    if (!actualCash || !actualCard || !actualTransfer) {
      toast.error('Debe ingresar todos los montos');
      return;
    }

    const count: CashCount = {
      cash: actualCashAmount,
      card: actualCardAmount,
      transfer: actualTransferAmount,
      notes
    };

    onSubmitCount(count);
    printCashReceipt();
    onClose();
  };

  const printCashReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>Recibo de Cuadre de Caja</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .company-name { 
              font-size: 18px; 
              font-weight: bold; 
            }
            .section { 
              margin-bottom: 20px; 
              border: 1px solid #ddd; 
              padding: 15px;
              border-radius: 5px;
            }
            .section h3 {
              margin: 0 0 10px 0;
              padding-bottom: 5px;
              border-bottom: 1px solid #eee;
            }
            .flex { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 5px; 
              padding: 2px 0;
            }
            .total { 
              font-weight: bold; 
              font-size: 14px; 
            }
            .difference-positive { 
              color: green; 
              font-weight: bold;
            }
            .difference-negative { 
              color: red; 
              font-weight: bold;
            }
            .balance-summary {
              background-color: #f8f9fa;
              border: 2px solid #333;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${businessSettings?.name || 'MI EMPRESA'}</div>
            <h1>CUADRE DE CAJA</h1>
            <p>Fecha: ${new Date().toLocaleDateString()}</p>
            <p>Hora: ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="balance-summary">
            <h3>📊 RESUMEN DE VENTAS DEL DÍA</h3>
            <div class="flex total"><span>Balance de Efectivo (sin apertura):</span><span>${currency} ${cashSalesBalance.toLocaleString()}</span></div>
            <div class="flex total"><span>Balance de Tarjetas:</span><span>${currency} ${expectedAmounts.card.toLocaleString()}</span></div>
            <div class="flex total"><span>Balance de Transferencias:</span><span>${currency} ${expectedAmounts.transfer.toLocaleString()}</span></div>
            <div class="flex total" style="border-top: 2px solid #333; margin-top: 10px; padding-top: 10px;">
              <span>TOTAL VENTAS DEL DÍA:</span>
              <span>${currency} ${totalSalesBalance.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>💰 EFECTIVO</h3>
            <div class="flex"><span>Apertura de caja:</span><span>${currency} ${openingAmount.toLocaleString()}</span></div>
            <div class="flex"><span>Ventas en efectivo:</span><span>${currency} ${cashSalesBalance.toLocaleString()}</span></div>
            <div class="flex"><span>Total esperado en caja:</span><span>${currency} ${expectedAmounts.cash.toLocaleString()}</span></div>
            <div class="flex"><span>Total actual en caja:</span><span>${currency} ${actualCashAmount.toLocaleString()}</span></div>
            <div class="flex total ${cashDifference >= 0 ? 'difference-positive' : 'difference-negative'}">
              <span>Diferencia:</span>
              <span>${cashDifference >= 0 ? '+' : ''}${currency} ${cashDifference.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>💳 TARJETAS</h3>
            <div class="flex"><span>Total esperado:</span><span>${currency} ${expectedAmounts.card.toLocaleString()}</span></div>
            <div class="flex"><span>Total reportado:</span><span>${currency} ${actualCardAmount.toLocaleString()}</span></div>
            <div class="flex total ${cardDifference >= 0 ? 'difference-positive' : 'difference-negative'}">
              <span>Diferencia:</span>
              <span>${cardDifference >= 0 ? '+' : ''}${currency} ${cardDifference.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>🔄 TRANSFERENCIAS</h3>
            <div class="flex"><span>Total esperado:</span><span>${currency} ${expectedAmounts.transfer.toLocaleString()}</span></div>
            <div class="flex"><span>Total reportado:</span><span>${currency} ${actualTransferAmount.toLocaleString()}</span></div>
            <div class="flex total ${transferDifference >= 0 ? 'difference-positive' : 'difference-negative'}">
              <span>Diferencia:</span>
              <span>${transferDifference >= 0 ? '+' : ''}${currency} ${transferDifference.toFixed(2)}</span>
            </div>
          </div>

          <div class="balance-summary">
            <h3>🎯 BALANCE FINAL</h3>
            <div class="flex total"><span>Total ventas esperado:</span><span>${currency} ${totalSalesBalance.toLocaleString()}</span></div>
            <div class="flex total"><span>Total ventas reportado:</span><span>${currency} ${totalActualBalance.toLocaleString()}</span></div>
            <div class="flex total ${totalDifference >= 0 ? 'difference-positive' : 'difference-negative'}" 
                 style="border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; font-size: 16px;">
              <span>DIFERENCIA TOTAL:</span>
              <span>${totalDifference >= 0 ? '+' : ''}${currency} ${totalDifference.toFixed(2)}</span>
            </div>
          </div>
          
          ${notes ? `
            <div class="section">
              <h3>📝 OBSERVACIONES</h3>
              <p>${notes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p><strong>${businessSettings?.name || 'MI EMPRESA'}</strong></p>
            <p>Cuadre realizado el: ${new Date().toLocaleString()}</p>
            ${businessSettings?.rnc ? `<p>RNC: ${businessSettings.rnc}</p>` : ''}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cuadre de Caja - Balance de Ventas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen de Ventas del Día */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">📊 Resumen de Ventas del Día</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Balance de Efectivo (sin apertura):</span>
                <span className="font-semibold">{currency} {cashSalesBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Balance de Tarjetas:</span>
                <span className="font-semibold">{currency} {expectedAmounts.card.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Balance de Transferencias:</span>
                <span className="font-semibold">{currency} {expectedAmounts.transfer.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL VENTAS DEL DÍA:</span>
                <span>{currency} {totalSalesBalance.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Efectivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
                Efectivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Apertura:</span>
                  <div className="font-semibold">{currency} {openingAmount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Ventas efectivo:</span>
                  <div className="font-semibold">{currency} {cashSalesBalance.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total esperado:</span>
                  <div className="font-semibold">{currency} {expectedAmounts.cash.toLocaleString()}</div>
                </div>
                <div>
                  <Label htmlFor="actual-cash">Actual en caja:</Label>
                  <Input
                    id="actual-cash"
                    type="number"
                    step="0.01"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              {actualCash && (
                <div className={`text-center p-2 rounded ${cashDifference >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  Diferencia: {cashDifference >= 0 ? '+' : ''}{currency} {cashDifference.toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tarjetas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Tarjetas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Esperado:</span>
                  <div className="font-semibold">{currency} {expectedAmounts.card.toLocaleString()}</div>
                </div>
                <div>
                  <Label htmlFor="actual-card">Monto reportado:</Label>
                  <Input
                    id="actual-card"
                    type="number"
                    step="0.01"
                    value={actualCard}
                    onChange={(e) => setActualCard(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              {actualCard && (
                <div className={`text-center p-2 rounded ${cardDifference >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  Diferencia: {cardDifference >= 0 ? '+' : ''}{currency} {cardDifference.toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transferencias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                Transferencias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Esperado:</span>
                  <div className="font-semibold">{currency} {expectedAmounts.transfer.toLocaleString()}</div>
                </div>
                <div>
                  <Label htmlFor="actual-transfer">Monto reportado:</Label>
                  <Input
                    id="actual-transfer"
                    type="number"
                    step="0.01"
                    value={actualTransfer}
                    onChange={(e) => setActualTransfer(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              {actualTransfer && (
                <div className={`text-center p-2 rounded ${transferDifference >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  Diferencia: {transferDifference >= 0 ? '+' : ''}{currency} {transferDifference.toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Balance Total */}
          {actualCash && actualCard && actualTransfer && (
            <Card className="bg-gray-50 border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">🎯 Balance Final</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total ventas esperado:</span>
                  <span className="font-semibold">{currency} {totalSalesBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total ventas reportado:</span>
                  <span className="font-semibold">{currency} {totalActualBalance.toLocaleString()}</span>
                </div>
                <hr />
                <div className={`flex justify-between text-lg font-bold ${totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>DIFERENCIA TOTAL:</span>
                  <span>{totalDifference >= 0 ? '+' : ''}{currency} {totalDifference.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="notes">Observaciones (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre el cuadre..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!actualCash || !actualCard || !actualTransfer} 
              className="flex-1"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Finalizar Cuadre
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CashCountModal;

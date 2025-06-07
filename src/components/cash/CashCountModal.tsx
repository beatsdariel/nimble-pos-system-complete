
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePos } from '@/contexts/PosContext';
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
  const [actualCash, setActualCash] = useState<string>('');
  const [actualCard, setActualCard] = useState<string>('');
  const [actualTransfer, setActualTransfer] = useState<string>('');
  const [notes, setNotes] = useState('');

  const actualCashAmount = parseFloat(actualCash) || 0;
  const actualCardAmount = parseFloat(actualCard) || 0;
  const actualTransferAmount = parseFloat(actualTransfer) || 0;

  const cashDifference = actualCashAmount - expectedAmounts.cash;
  const cardDifference = actualCardAmount - expectedAmounts.card;
  const transferDifference = actualTransferAmount - expectedAmounts.transfer;

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
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            .flex { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; font-size: 16px; }
            .difference { color: ${cashDifference >= 0 && cardDifference >= 0 && transferDifference >= 0 ? 'green' : 'red'}; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RECIBO DE CUADRE DE CAJA</h1>
            <p>Fecha: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="section">
            <h3>EFECTIVO</h3>
            <div class="flex"><span>Apertura de caja:</span><span>RD$ ${openingAmount.toLocaleString()}</span></div>
            <div class="flex"><span>Esperado:</span><span>RD$ ${expectedAmounts.cash.toLocaleString()}</span></div>
            <div class="flex"><span>Actual:</span><span>RD$ ${actualCashAmount.toLocaleString()}</span></div>
            <div class="flex total difference"><span>Diferencia:</span><span>RD$ ${cashDifference.toFixed(2)}</span></div>
          </div>
          
          <div class="section">
            <h3>TARJETAS</h3>
            <div class="flex"><span>Esperado:</span><span>RD$ ${expectedAmounts.card.toLocaleString()}</span></div>
            <div class="flex"><span>Actual:</span><span>RD$ ${actualCardAmount.toLocaleString()}</span></div>
            <div class="flex total difference"><span>Diferencia:</span><span>RD$ ${cardDifference.toFixed(2)}</span></div>
          </div>
          
          <div class="section">
            <h3>TRANSFERENCIAS</h3>
            <div class="flex"><span>Esperado:</span><span>RD$ ${expectedAmounts.transfer.toLocaleString()}</span></div>
            <div class="flex"><span>Actual:</span><span>RD$ ${actualTransferAmount.toLocaleString()}</span></div>
            <div class="flex total difference"><span>Diferencia:</span><span>RD$ ${transferDifference.toFixed(2)}</span></div>
          </div>
          
          ${notes ? `<div class="section"><strong>Observaciones:</strong> ${notes}</div>` : ''}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Recibo de Cuadre de Caja
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Efectivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
                Efectivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Apertura:</span>
                  <div className="font-semibold">RD$ {openingAmount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Esperado:</span>
                  <div className="font-semibold">RD$ {expectedAmounts.cash.toLocaleString()}</div>
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
                  Diferencia: {cashDifference >= 0 ? '+' : ''}RD$ {cashDifference.toFixed(2)}
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
                  <div className="font-semibold">RD$ {expectedAmounts.card.toLocaleString()}</div>
                </div>
                <div>
                  <Label htmlFor="actual-card">Monto actual:</Label>
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
                  Diferencia: {cardDifference >= 0 ? '+' : ''}RD$ {cardDifference.toFixed(2)}
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
                  <div className="font-semibold">RD$ {expectedAmounts.transfer.toLocaleString()}</div>
                </div>
                <div>
                  <Label htmlFor="actual-transfer">Monto actual:</Label>
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
                  Diferencia: {transferDifference >= 0 ? '+' : ''}RD$ {transferDifference.toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

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

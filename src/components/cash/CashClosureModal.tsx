
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
import { Calculator, DollarSign, Receipt } from 'lucide-react';

interface CashClosureModalProps {
  open: boolean;
  onClose: () => void;
}

const CashClosureModal: React.FC<CashClosureModalProps> = ({ open, onClose }) => {
  const { currentUser, currentSession, createCashClosure, getSessionSales, getSessionExpenses, getExpectedCash } = useAuth();
  const { sales } = usePos();
  const [countedCash, setCountedCash] = useState('');
  const [notes, setNotes] = useState('');

  const sessionSales = getSessionSales();
  const sessionExpenses = getSessionExpenses();
  const expectedCash = getExpectedCash();
  const difference = parseFloat(countedCash) - expectedCash;

  // Contar ventas de la sesión actual
  const sessionSalesCount = sales.filter(sale => 
    currentSession && new Date(sale.date) >= new Date(currentSession.startTime)
  ).length;

  const handleCloseCash = () => {
    if (!currentUser || !currentSession) return;

    if (!countedCash) {
      toast({
        title: "Error",
        description: "Debe ingresar el efectivo contado",
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
      countedCash: parseFloat(countedCash),
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

    onClose();
    setCountedCash('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cierre de Caja
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div>
                <Label htmlFor="countedCash">Efectivo Contado</Label>
                <Input
                  id="countedCash"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                />
              </div>

              {countedCash && (
                <div className="p-3 bg-gray-50 rounded-lg">
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

              <div>
                <Label htmlFor="notes">Observaciones (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales sobre el cierre..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCloseCash} disabled={!countedCash}>
            Realizar Cierre
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CashClosureModal;

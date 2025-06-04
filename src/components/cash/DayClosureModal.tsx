
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePos } from '@/contexts/PosContext';
import { toast } from '@/hooks/use-toast';
import { Calendar, TrendingUp, Users, CreditCard, DollarSign } from 'lucide-react';

interface DayClosureModalProps {
  open: boolean;
  onClose: () => void;
}

const DayClosureModal: React.FC<DayClosureModalProps> = ({ open, onClose }) => {
  const { currentUser, cashClosures, createDayClosure } = useAuth();
  const { sales } = usePos();
  const [isProcessing, setIsProcessing] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  
  // Filtrar ventas del día
  const todaySales = sales.filter(sale => 
    sale.date.startsWith(today)
  );

  // Calcular totales del día
  const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = todaySales.length;
  
  // Separar pagos por método
  const totalCash = todaySales.reduce((sum, sale) => {
    const cashPayments = sale.payments.filter(p => p.type === 'cash');
    return sum + cashPayments.reduce((cashSum, payment) => cashSum + payment.amount, 0);
  }, 0);

  const totalCard = todaySales.reduce((sum, sale) => {
    const cardPayments = sale.payments.filter(p => p.type === 'card');
    return sum + cardPayments.reduce((cardSum, payment) => cardSum + payment.amount, 0);
  }, 0);

  // Gastos del día (esto se podría expandir con un sistema de gastos)
  const totalExpenses = 0;

  // Cierres de caja del día
  const todayCashClosures = cashClosures.filter(closure =>
    closure.startTime.startsWith(today)
  );

  const handleDayClosure = async () => {
    if (!currentUser) return;

    setIsProcessing(true);

    try {
      const dayClosure = {
        date: today,
        totalSales,
        totalExpenses,
        totalCash,
        totalCard,
        totalTransactions,
        cashClosures: todayCashClosures,
        createdBy: currentUser.id
      };

      createDayClosure(dayClosure);

      toast({
        title: "Cierre de día realizado",
        description: `Total del día: RD$ ${totalSales.toLocaleString()}`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo realizar el cierre de día",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cierre de Día - {new Date().toLocaleDateString()}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Resumen General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Resumen General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Total de ventas:</span>
                <span className="font-bold text-green-600">RD$ {totalSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Transacciones:</span>
                <span className="font-medium">{totalTransactions}</span>
              </div>
              <div className="flex justify-between">
                <span>Gastos:</span>
                <span className="font-medium text-red-600">RD$ {totalExpenses.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg">
                <span>Neto del día:</span>
                <span className="font-bold text-blue-600">RD$ {(totalSales - totalExpenses).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Métodos de Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Métodos de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>Efectivo:</span>
                </div>
                <span className="font-medium">RD$ {totalCash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span>Tarjeta:</span>
                </div>
                <span className="font-medium">RD$ {totalCard.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold">RD$ {(totalCash + totalCard).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Cierres de Caja */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Cierres de Caja
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayCashClosures.length > 0 ? (
                <div className="space-y-2">
                  {todayCashClosures.map((closure, index) => (
                    <div key={closure.id} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Cierre #{index + 1}</span>
                        <Badge variant={closure.difference === 0 ? "default" : "destructive"}>
                          {closure.difference === 0 ? 'Cuadrada' : 'Con diferencia'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        Diferencia: RD$ {closure.difference.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay cierres de caja registrados</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalle de Ventas */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Ventas del Día</CardTitle>
          </CardHeader>
          <CardContent>
            {todaySales.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left">Recibo</th>
                      <th className="text-left">Hora</th>
                      <th className="text-right">Items</th>
                      <th className="text-right">Total</th>
                      <th className="text-left">Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaySales.map((sale) => (
                      <tr key={sale.id} className="border-b">
                        <td>{sale.receiptNumber}</td>
                        <td>{new Date(sale.date).toLocaleTimeString()}</td>
                        <td className="text-right">{sale.items.length}</td>
                        <td className="text-right">RD$ {sale.total.toLocaleString()}</td>
                        <td>{sale.payments.map(p => p.type).join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No hay ventas registradas hoy</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDayClosure} 
            disabled={isProcessing || totalSales === 0}
          >
            {isProcessing ? 'Procesando...' : 'Realizar Cierre de Día'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayClosureModal;

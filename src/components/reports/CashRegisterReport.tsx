
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { DollarSign, Calculator, Printer, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const CashRegisterReport = () => {
  const { sales, currentUser } = usePos();
  const [actualCash, setActualCash] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  // Sample data for demonstration - in real app this would come from context
  const openingAmount = 500.00;
  const currentDate = new Date().toLocaleDateString('es-DO');
  const currentTime = new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });

  // Calculate sales data for today
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(sale => sale.date.startsWith(today));
  
  const cashSales = todaySales.reduce((sum, sale) => {
    return sum + sale.payments.filter(p => p.type === 'cash').reduce((s, p) => s + p.amount, 0);
  }, 0);

  const cardSales = todaySales.reduce((sum, sale) => {
    return sum + sale.payments.filter(p => p.type === 'card').reduce((s, p) => s + p.amount, 0);
  }, 0);

  const creditSales = todaySales.reduce((sum, sale) => {
    return sum + sale.payments.filter(p => p.type === 'credit').reduce((s, p) => s + p.amount, 0);
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
    
    toast.success('Cuadre de caja completado');
    setShowDetails(true);
  };

  const handlePrint = () => {
    // In a real app, this would trigger actual printing
    toast.success('Imprimiendo cuadre de caja...');
  };

  const salesByPaymentMethod = [
    { method: 'Efectivo', amount: cashSales, icon: DollarSign, color: 'text-green-600' },
    { method: 'Tarjeta', amount: cardSales, icon: DollarSign, color: 'text-blue-600' },
    { method: 'Crédito', amount: creditSales, icon: Clock, color: 'text-orange-600' }
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Cuadre de Caja
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Usuario</div>
              <div className="font-semibold">{currentUser?.name || 'ADMIN'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Fecha</div>
              <div className="font-semibold">{currentDate}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Hora</div>
              <div className="font-semibold">{currentTime}</div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Summary */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumen de Ventas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total de Ventas:</span>
                <span className="font-semibold text-lg">RD$ {totalSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Número de Transacciones:</span>
                <span className="font-semibold">{todaySales.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Venta Promedio:</span>
                <span className="font-semibold">
                  RD$ {todaySales.length > 0 ? (totalSales / todaySales.length).toLocaleString() : '0.00'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ventas por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {salesByPaymentMethod.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span>{item.method}:</span>
                  </div>
                  <span className="font-semibold">RD$ {item.amount.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Cash Count */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conteo de Efectivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Apertura de Caja</div>
                <div className="font-semibold text-lg">RD$ {openingAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Ventas en Efectivo</div>
                <div className="font-semibold text-lg text-green-600">+ RD$ {cashSales.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Efectivo Esperado</div>
                <div className="font-semibold text-lg">RD$ {expectedCash.toLocaleString()}</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label htmlFor="actual-cash">Efectivo Actual en Caja</Label>
              <div className="flex gap-4 mt-2">
                <Input
                  id="actual-cash"
                  type="number"
                  placeholder="0.00"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  step="0.01"
                  min="0"
                  className="flex-1"
                />
                <Button onClick={handleCloseCash} disabled={!actualCash}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular Diferencia
                </Button>
              </div>
            </div>

            {showDetails && actualCash && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span>Efectivo Esperado:</span>
                  <span className="font-semibold">RD$ {expectedCash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Efectivo Actual:</span>
                  <span className="font-semibold">RD$ {actualCashAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span>Diferencia:</span>
                  <div className="flex items-center gap-2">
                    {difference >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-semibold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      RD$ {Math.abs(difference).toLocaleString()}
                    </span>
                    <Badge variant={difference >= 0 ? 'default' : 'destructive'}>
                      {difference >= 0 ? 'Sobrante' : 'Faltante'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {showDetails && (
          <div className="flex gap-4">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Cuadre
            </Button>
            <Button variant="outline" className="flex-1">
              <DollarSign className="h-4 w-4 mr-2" />
              Cerrar Caja
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashRegisterReport;

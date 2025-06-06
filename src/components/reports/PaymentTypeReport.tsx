
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePos } from '@/contexts/PosContext';
import { CreditCard, Printer, FileDown } from 'lucide-react';

const PaymentTypeReport = () => {
  const { sales } = usePos();

  const paymentData = sales.reduce((acc, sale) => {
    // Get the primary payment method (first one or default to cash)
    const primaryPayment = sale.payments[0];
    const method = primaryPayment ? primaryPayment.type : 'cash';
    const methodLabel = method === 'cash' ? 'Efectivo' : 
                       method === 'card' ? 'Tarjeta' :
                       method === 'transfer' ? 'Transferencia' :
                       method === 'credit' ? 'Crédito' : 
                       method.charAt(0).toUpperCase() + method.slice(1);
    
    if (!acc[methodLabel]) {
      acc[methodLabel] = { method: methodLabel, transactions: 0, totalAmount: 0 };
    }
    acc[methodLabel].transactions += 1;
    acc[methodLabel].totalAmount += sale.total;
    return acc;
  }, {} as Record<string, any>);

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Ventas por Tipo de Pago
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Método de Pago</TableHead>
                <TableHead>Transacciones</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Porcentaje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(paymentData).map((payment: any, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{payment.method}</TableCell>
                  <TableCell>{payment.transactions}</TableCell>
                  <TableCell>RD$ {payment.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    {totalSales > 0 ? ((payment.totalAmount / totalSales) * 100).toFixed(1) : '0.0'}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTypeReport;

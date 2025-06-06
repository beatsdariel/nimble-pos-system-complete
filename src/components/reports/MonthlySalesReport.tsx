
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePos } from '@/contexts/PosContext';
import { BarChart3, Printer, FileDown } from 'lucide-react';

const MonthlySalesReport = () => {
  const { sales } = usePos();

  const monthlySalesData = sales.reduce((acc, sale) => {
    const monthKey = new Date(sale.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, transactions: 0, totalAmount: 0 };
    }
    acc[monthKey].transactions += 1;
    acc[monthKey].totalAmount += sale.total;
    return acc;
  }, {} as Record<string, any>);

  const monthlyData = Object.values(monthlySalesData);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resumen de Ventas por Mes
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
                <TableHead>Mes</TableHead>
                <TableHead>Transacciones</TableHead>
                <TableHead>Total Ventas</TableHead>
                <TableHead>Promedio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((month, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{month.month}</TableCell>
                  <TableCell>{month.transactions}</TableCell>
                  <TableCell>RD$ {month.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>RD$ {(month.totalAmount / month.transactions).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlySalesReport;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePos } from '@/contexts/PosContext';
import { Receipt, Printer, FileDown } from 'lucide-react';

const NCFSalesReport = () => {
  const { sales, getCustomer } = usePos();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Relación de Ventas NCF
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
                <TableHead>NCF</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>ITBIS</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => {
                const customer = sale.customerId ? getCustomer(sale.customerId) : null;
                const customerName = customer?.name || 'Cliente General';
                
                return (
                  <TableRow key={sale.id}>
                    <TableCell>B01{sale.id.padStart(8, '0')}</TableCell>
                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                    <TableCell>{customerName}</TableCell>
                    <TableCell>RD$ {(sale.total - sale.tax).toLocaleString()}</TableCell>
                    <TableCell>RD$ {sale.tax.toLocaleString()}</TableCell>
                    <TableCell>RD$ {sale.total.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default NCFSalesReport;

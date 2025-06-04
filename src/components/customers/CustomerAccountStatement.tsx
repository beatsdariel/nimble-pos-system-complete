
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Customer, Sale } from '@/types/pos';
import { usePos } from '@/contexts/PosContext';
import { FilePrinted, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CustomerAccountStatementProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const CustomerAccountStatement: React.FC<CustomerAccountStatementProps> = ({ 
  open, 
  onClose, 
  customer 
}) => {
  const { getCreditSales } = usePos();

  if (!customer) return null;

  const creditSales = customer.id ? getCreditSales(customer.id) : [];
  const totalCredit = creditSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalPaid = creditSales.reduce((sum, sale) => {
    const paidAmount = sale.payments.reduce((pSum, payment) => pSum + payment.amount, 0);
    return sum + paidAmount;
  }, 0);
  const totalPending = totalCredit - totalPaid;

  const printStatement = () => {
    console.log('Printing customer account statement', {
      customer,
      creditSales,
      totalCredit,
      totalPaid,
      totalPending,
      date: new Date()
    });
    toast.success('Imprimiendo estado de cuenta');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Estado de Cuenta - {customer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Límite de Crédito</p>
                <p className="font-semibold">
                  RD$ {(customer.creditLimit || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Balance Actual</p>
                <p className="font-semibold text-red-600">
                  RD$ {(customer.creditBalance || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Disponible</p>
                <p className="font-semibold text-green-600">
                  RD$ {((customer.creditLimit || 0) - (customer.creditBalance || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <h3 className="font-medium">Facturas a Crédito</h3>
          
          {creditSales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Recibo</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Pendiente</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditSales.map((sale) => {
                  const paidAmount = sale.payments.reduce((sum, payment) => sum + payment.amount, 0);
                  const pendingAmount = sale.total - paidAmount;
                  
                  return (
                    <TableRow key={sale.id}>
                      <TableCell>{format(new Date(sale.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{sale.receiptNumber}</TableCell>
                      <TableCell>RD$ {sale.total.toLocaleString()}</TableCell>
                      <TableCell>RD$ {paidAmount.toLocaleString()}</TableCell>
                      <TableCell>RD$ {pendingAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          sale.status === 'paid-credit' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sale.status === 'paid-credit' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <p>Este cliente no tiene facturas a crédito</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={printStatement}>
              <FilePrinted className="h-4 w-4 mr-2" />
              Imprimir Estado de Cuenta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerAccountStatement;

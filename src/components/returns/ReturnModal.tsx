
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sale, ReturnedItem } from '@/types/pos';
import { usePos } from '@/contexts/PosContext';
import { toast } from 'sonner';
import { ArrowLeftCircle, Printer } from 'lucide-react';

interface ReturnModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const ReturnModal: React.FC<ReturnModalProps> = ({ open, onClose, sale }) => {
  const { processReturn } = usePos();
  const [returningItems, setReturningItems] = useState<Array<{
    productId: string;
    name: string;
    price: number;
    originalQuantity: number;
    returnQuantity: number;
    reason: string;
  }>>([]);
  const [returnTotal, setReturnTotal] = useState(0);

  useEffect(() => {
    if (sale) {
      const initialItems = sale.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        originalQuantity: item.quantity,
        returnQuantity: 0,
        reason: ''
      }));
      setReturningItems(initialItems);
    } else {
      setReturningItems([]);
    }
  }, [sale]);

  useEffect(() => {
    const total = returningItems.reduce((sum, item) => 
      sum + (item.price * item.returnQuantity), 0
    );
    setReturnTotal(total);
  }, [returningItems]);

  const handleQuantityChange = (index: number, value: number) => {
    const newValue = Math.max(0, Math.min(value, returningItems[index].originalQuantity));
    const newItems = [...returningItems];
    newItems[index].returnQuantity = newValue;
    setReturningItems(newItems);
  };

  const handleReasonChange = (index: number, value: string) => {
    const newItems = [...returningItems];
    newItems[index].reason = value;
    setReturningItems(newItems);
  };

  const handleSubmit = () => {
    if (!sale) return;
    
    // Check if any items are being returned
    const itemsToReturn = returningItems.filter(item => item.returnQuantity > 0);
    if (itemsToReturn.length === 0) {
      toast.error('Debe seleccionar al menos un producto para devolver');
      return;
    }
    
    // Check if all returning items have a reason
    const missingReason = itemsToReturn.some(item => !item.reason.trim());
    if (missingReason) {
      toast.error('Todos los productos a devolver deben tener un motivo');
      return;
    }
    
    // Process the return
    const returnItems: ReturnedItem[] = itemsToReturn.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.returnQuantity,
      returnReason: item.reason,
      returnDate: new Date().toISOString(),
      originalSaleId: sale.id
    }));
    
    const returnId = processReturn(sale.id, returnItems);
    
    if (returnId) {
      toast.success(`Devolución procesada con ID: ${returnId}`);
      onClose();

      // Simulate printing return receipt
      setTimeout(() => {
        console.log('Printing return receipt', {
          returnId,
          date: new Date().toISOString(),
          originalSale: sale.receiptNumber,
          items: returnItems,
          totalAmount: returnTotal
        });
        toast.info('Imprimiendo comprobante de devolución');
      }, 1000);
    } else {
      toast.error('Error al procesar la devolución');
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftCircle className="h-5 w-5" />
            Procesar Devolución
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Detalles de la Venta Original</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm"><strong>Recibo:</strong> {sale.receiptNumber}</p>
                <p className="text-sm"><strong>Fecha:</strong> {new Date(sale.date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm"><strong>Total:</strong> RD$ {sale.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Productos a Devolver</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="w-24">Cant. Original</TableHead>
                  <TableHead className="w-24">Cant. a Devolver</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returningItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>RD$ {item.price.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{item.originalQuantity}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0" 
                        max={item.originalQuantity}
                        value={item.returnQuantity} 
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        placeholder="Razón de la devolución"
                        value={item.reason}
                        onChange={(e) => handleReasonChange(index, e.target.value)}
                        disabled={item.returnQuantity === 0}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Total a Devolver:</h3>
              <span className="text-xl font-bold">RD$ {returnTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <ArrowLeftCircle className="h-4 w-4" />
              Procesar Devolución
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnModal;

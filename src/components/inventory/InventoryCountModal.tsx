
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { InventoryCount, InventoryCountItem } from '@/types/inventory';
import { toast } from 'sonner';

interface InventoryCountModalProps {
  open: boolean;
  onClose: () => void;
  inventoryCount: InventoryCount | null;
}

const InventoryCountModal: React.FC<InventoryCountModalProps> = ({ open, onClose, inventoryCount }) => {
  const { products, addInventoryCount, updateInventoryCount, updateProduct } = usePos();
  const [items, setItems] = useState<InventoryCountItem[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (inventoryCount) {
      setItems(inventoryCount.items);
      setNotes(inventoryCount.notes || '');
    } else {
      // Initialize with all products
      const initialItems: InventoryCountItem[] = products.map(product => ({
        productId: product.id,
        productName: product.name,
        systemQuantity: product.stock,
        countedQuantity: product.stock,
        difference: 0,
        unitCost: product.cost,
        totalCostDifference: 0
      }));
      setItems(initialItems);
      setNotes('');
    }
  }, [inventoryCount, products, open]);

  const updateCountedQuantity = (index: number, countedQuantity: number) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    item.countedQuantity = countedQuantity;
    item.difference = countedQuantity - item.systemQuantity;
    item.totalCostDifference = item.difference * item.unitCost;
    setItems(updatedItems);
  };

  const totalDifference = items.reduce((sum, item) => sum + item.totalCostDifference, 0);
  const itemsWithDifferences = items.filter(item => item.difference !== 0);

  const handleComplete = () => {
    const countData = {
      date: new Date().toISOString(),
      status: 'completed' as const,
      items,
      notes: notes || undefined
    };

    if (inventoryCount) {
      updateInventoryCount(inventoryCount.id, countData);
    } else {
      addInventoryCount(countData);
    }

    // Update product stock based on count
    items.forEach(item => {
      if (item.difference !== 0) {
        updateProduct(item.productId, {
          stock: item.countedQuantity
        });
      }
    });

    toast.success('Conteo de inventario completado');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {inventoryCount ? 'Ver Conteo de Inventario' : 'Nuevo Conteo de Inventario'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones del conteo..."
            />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3">Producto</th>
                      <th className="text-right p-3">Stock Sistema</th>
                      <th className="text-right p-3">Cantidad Contada</th>
                      <th className="text-right p-3">Diferencia</th>
                      <th className="text-right p-3">Costo Unit.</th>
                      <th className="text-right p-3">Diferencia Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.productId} className="border-b">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{item.productName}</p>
                          </div>
                        </td>
                        <td className="p-3 text-right">{item.systemQuantity}</td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={item.countedQuantity}
                            onChange={(e) => updateCountedQuantity(index, parseInt(e.target.value) || 0)}
                            className="w-20 text-right"
                            disabled={inventoryCount?.status === 'completed'}
                          />
                        </td>
                        <td className="p-3 text-right">
                          <Badge variant={
                            item.difference === 0 ? "default" :
                            item.difference > 0 ? "default" : "destructive"
                          }>
                            {item.difference > 0 ? '+' : ''}{item.difference}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          RD$ {item.unitCost.toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          <span className={item.totalCostDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                            RD$ {item.totalCostDifference.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3">Resumen del Conteo</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Productos con Diferencias</p>
                  <p className="text-2xl font-bold">{itemsWithDifferences.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Diferencia Total en Costo</p>
                  <p className={`text-2xl font-bold ${totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    RD$ {totalDifference.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <Badge variant={inventoryCount?.status === 'completed' ? 'default' : 'secondary'}>
                    {inventoryCount?.status === 'completed' ? 'Completado' : 'En Progreso'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {(!inventoryCount || inventoryCount.status !== 'completed') && (
              <Button onClick={handleComplete}>
                Completar Conteo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryCountModal;

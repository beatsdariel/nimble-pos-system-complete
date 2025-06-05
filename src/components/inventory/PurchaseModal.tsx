
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { usePos } from '@/contexts/PosContext';
import { Purchase, PurchaseItem } from '@/types/inventory';
import { toast } from 'sonner';
import { Plus, Trash2, Receipt } from 'lucide-react';

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  purchase: Purchase | null;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ open, onClose, purchase }) => {
  const { suppliers, products, addPurchase, updatePurchase } = usePos();
  const [formData, setFormData] = useState({
    supplierId: '',
    purchaseNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'pending' as 'pending' | 'received' | 'partial' | 'cancelled',
    notes: '',
    // New fiscal fields
    fiscalReceipt: false,
    fiscalNumber: '',
    paymentType: 'cash' as 'cash' | 'credit',
    invoiceNumber: ''
  });
  const [items, setItems] = useState<PurchaseItem[]>([]);

  useEffect(() => {
    if (purchase) {
      setFormData({
        supplierId: purchase.supplierId,
        purchaseNumber: purchase.purchaseNumber,
        date: purchase.date.split('T')[0],
        dueDate: purchase.dueDate?.split('T')[0] || '',
        status: purchase.status,
        notes: purchase.notes || '',
        fiscalReceipt: (purchase as any).fiscalReceipt || false,
        fiscalNumber: (purchase as any).fiscalNumber || '',
        paymentType: (purchase as any).paymentType || 'cash',
        invoiceNumber: (purchase as any).invoiceNumber || ''
      });
      setItems(purchase.items);
    } else {
      setFormData({
        supplierId: '',
        purchaseNumber: `PUR-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: 'pending',
        notes: '',
        fiscalReceipt: false,
        fiscalNumber: '',
        paymentType: 'cash',
        invoiceNumber: ''
      });
      setItems([]);
    }
  }, [purchase, open]);

  const addItem = () => {
    setItems([...items, {
      productId: '',
      productName: '',
      quantity: 1,
      unitCost: 0,
      total: 0
    }]);
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].productName = product.name;
        updatedItems[index].unitCost = product.cost;
      }
    }
    
    if (field === 'quantity' || field === 'unitCost') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitCost;
    }
    
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    const supplier = suppliers.find(s => s.id === formData.supplierId);
    if (!supplier) {
      toast.error('Debe seleccionar un proveedor');
      return;
    }

    // Validate fiscal receipt fields
    if (formData.fiscalReceipt && !formData.fiscalNumber) {
      toast.error('Debe ingresar el número de comprobante fiscal');
      return;
    }

    const purchaseData = {
      supplierId: formData.supplierId,
      supplierName: supplier.name,
      purchaseNumber: formData.purchaseNumber,
      date: formData.date,
      dueDate: formData.dueDate || undefined,
      status: formData.status,
      items,
      subtotal,
      tax,
      total,
      paidAmount: formData.paymentType === 'cash' ? total : 0,
      notes: formData.notes || undefined,
      // Add fiscal fields to purchase data
      fiscalReceipt: formData.fiscalReceipt,
      fiscalNumber: formData.fiscalNumber || undefined,
      paymentType: formData.paymentType,
      invoiceNumber: formData.invoiceNumber || undefined
    };

    if (purchase) {
      updatePurchase(purchase.id, purchaseData as any);
      toast.success('Compra actualizada exitosamente');
    } else {
      addPurchase(purchaseData as any);
      toast.success('Compra registrada exitosamente');
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {purchase ? 'Editar Compra' : 'Nueva Compra'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Proveedor *</Label>
              <Select value={formData.supplierId} onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter(s => s.isActive).map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="purchaseNumber">Número de Compra</Label>
              <Input
                id="purchaseNumber"
                value={formData.purchaseNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, purchaseNumber: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value: 'pending' | 'received' | 'partial' | 'cancelled') => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="received">Recibida</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fiscal Receipt Section */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Información Fiscal</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fiscalReceipt">Comprobante Fiscal</Label>
                  <Switch
                    id="fiscalReceipt"
                    checked={formData.fiscalReceipt}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, fiscalReceipt: checked }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="paymentType">Tipo de Pago</Label>
                  <Select value={formData.paymentType} onValueChange={(value: 'cash' | 'credit') => setFormData(prev => ({ ...prev, paymentType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Contado</SelectItem>
                      <SelectItem value="credit">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.fiscalReceipt && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="fiscalNumber">Número de Comprobante Fiscal *</Label>
                    <Input
                      id="fiscalNumber"
                      value={formData.fiscalNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, fiscalNumber: e.target.value }))}
                      placeholder="B0100000001"
                      required={formData.fiscalReceipt}
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceNumber">Número de Factura</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      placeholder="FAC-001"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Productos</h3>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 items-end">
                    <div>
                      <Label>Producto</Label>
                      <Select value={item.productId} onValueChange={(value) => updateItem(index, 'productId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label>Costo Unitario</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Total</Label>
                      <Input
                        type="number"
                        value={item.total.toFixed(2)}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-end space-y-1">
                  <div className="text-right">
                    <p>Subtotal: RD$ {subtotal.toFixed(2)}</p>
                    <p>ITBIS (18%): RD$ {tax.toFixed(2)}</p>
                    <p className="font-bold text-lg">Total: RD$ {total.toFixed(2)}</p>
                    {formData.paymentType === 'credit' && (
                      <p className="text-orange-600 font-medium">Pendiente de Pago</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales sobre la compra"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {purchase ? 'Actualizar' : 'Registrar'} Compra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;

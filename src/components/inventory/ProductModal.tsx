
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePos } from '@/contexts/PosContext';
import { Product } from '@/types/pos';
import { toast } from 'sonner';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ open, onClose, product }) => {
  const { addProduct, updateProduct } = usePos();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    category: '',
    taxRate: '0.18'
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        barcode: product.barcode,
        sku: product.sku,
        price: product.price.toString(),
        cost: product.cost.toString(),
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        category: product.category,
        taxRate: product.taxRate.toString()
      });
    } else {
      setFormData({
        name: '',
        description: '',
        barcode: '',
        sku: '',
        price: '',
        cost: '',
        stock: '',
        minStock: '',
        category: '',
        taxRate: '0.18'
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      description: formData.description,
      barcode: formData.barcode,
      sku: formData.sku,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      category: formData.category,
      taxRate: parseFloat(formData.taxRate)
    };

    if (product) {
      updateProduct(product.id, productData);
      toast.success('Producto actualizado exitosamente');
    } else {
      addProduct(productData);
      toast.success('Producto creado exitosamente');
    }

    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleChange('barcode', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Precio de Costo *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleChange('cost', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Precio de Venta *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stock">Stock Actual *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="minStock">Stock Mínimo *</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => handleChange('minStock', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="taxRate">Tasa de Impuesto</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {product ? 'Actualizar' : 'Crear'} Producto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;

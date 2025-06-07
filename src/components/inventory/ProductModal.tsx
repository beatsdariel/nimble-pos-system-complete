
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { usePos } from '@/contexts/PosContext';
import { Product } from '@/types/pos';
import { toast } from 'sonner';
import { Package, Calculator } from 'lucide-react';

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
    wholesalePrice: '',
    cost: '',
    stock: '',
    minStock: '',
    category: '',
    taxRate: '0.18',
    taxType: 'calculated' as 'included' | 'calculated' | 'exempt',
    isFractional: false,
    unitOfMeasure: 'unidad' as 'caja' | 'paquete' | 'libra' | 'unidad' | 'metro' | 'kilogramo',
    fractionalUnit: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        barcode: product.barcode,
        sku: product.sku,
        price: product.price.toString(),
        wholesalePrice: product.wholesalePrice?.toString() || '',
        cost: product.cost.toString(),
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        category: product.category,
        taxRate: product.taxRate.toString(),
        taxType: product.taxType || 'calculated',
        isFractional: product.isFractional || false,
        unitOfMeasure: product.unitOfMeasure || 'unidad',
        fractionalUnit: product.fractionalUnit || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        barcode: '',
        sku: '',
        price: '',
        wholesalePrice: '',
        cost: '',
        stock: '',
        minStock: '',
        category: '',
        taxRate: '0.18',
        taxType: 'calculated',
        isFractional: false,
        unitOfMeasure: 'unidad',
        fractionalUnit: ''
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
      wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : undefined,
      cost: parseFloat(formData.cost),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      category: formData.category,
      taxRate: formData.taxType === 'exempt' ? 0 : parseFloat(formData.taxRate),
      taxType: formData.taxType,
      isFractional: formData.isFractional,
      unitOfMeasure: formData.unitOfMeasure,
      fractionalUnit: formData.isFractional ? formData.fractionalUnit : undefined
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

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTaxTypeDescription = (taxType: string) => {
    switch (taxType) {
      case 'included':
        return 'El ITBIS está incluido en el precio de venta';
      case 'calculated':
        return 'El ITBIS se calcula sobre el precio de venta';
      case 'exempt':
        return 'El producto está exento de ITBIS';
      default:
        return '';
    }
  };

  const showTaxRateField = formData.taxType === 'included' || formData.taxType === 'calculated';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Unidad de Medida y Fracciones */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Configuración de Medidas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitOfMeasure">Unidad de Medida *</Label>
                <Select value={formData.unitOfMeasure} onValueChange={(value: any) => handleChange('unitOfMeasure', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidad">Unidad</SelectItem>
                    <SelectItem value="caja">Caja</SelectItem>
                    <SelectItem value="paquete">Paquete</SelectItem>
                    <SelectItem value="libra">Libra</SelectItem>
                    <SelectItem value="kilogramo">Kilogramo</SelectItem>
                    <SelectItem value="metro">Metro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="isFractional"
                  checked={formData.isFractional}
                  onCheckedChange={(checked) => handleChange('isFractional', checked)}
                />
                <Label htmlFor="isFractional">Artículo Fraccional</Label>
              </div>
            </div>

            {formData.isFractional && (
              <div>
                <Label htmlFor="fractionalUnit">Unidad Fraccional</Label>
                <Input
                  id="fractionalUnit"
                  value={formData.fractionalUnit}
                  onChange={(e) => handleChange('fractionalUnit', e.target.value)}
                  placeholder="ej: gramos, mililitros, centímetros"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
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
            <div>
              <Label htmlFor="wholesalePrice">Precio Mayorista</Label>
              <Input
                id="wholesalePrice"
                type="number"
                step="0.01"
                value={formData.wholesalePrice}
                onChange={(e) => handleChange('wholesalePrice', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stock">Stock Actual *</Label>
              <Input
                id="stock"
                type="number"
                step={formData.isFractional ? "0.01" : "1"}
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
                step={formData.isFractional ? "0.01" : "1"}
                value={formData.minStock}
                onChange={(e) => handleChange('minStock', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="taxType">Tipo de ITBIS *</Label>
              <Select value={formData.taxType} onValueChange={(value: 'included' | 'calculated' | 'exempt') => {
                handleChange('taxType', value);
                if (value === 'exempt') {
                  handleChange('taxRate', '0');
                } else {
                  handleChange('taxRate', '0.18');
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calculated">ITBIS Calculado</SelectItem>
                  <SelectItem value="included">ITBIS Incluido</SelectItem>
                  <SelectItem value="exempt">Sin ITBIS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showTaxRateField && (
            <div>
              <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', e.target.value)}
                min="0"
                max="1"
                disabled={formData.taxType === 'exempt'}
              />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Información del ITBIS</span>
            </div>
            <p className="text-sm text-blue-700">
              {getTaxTypeDescription(formData.taxType)}
            </p>
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

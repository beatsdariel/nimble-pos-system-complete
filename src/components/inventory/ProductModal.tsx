import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { Product } from '@/types/pos';
import { Calculator, Percent } from 'lucide-react';
import { toast } from 'sonner';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ open, onClose, product }) => {
  const { addProduct, updateProduct } = usePos();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    price: 0,
    cost: 0,
    wholesalePrice: 0,
    stock: 0,
    minStock: 0,
    maxStock: 0,
    category: '',
    taxRate: 18,
    taxType: 'included' as 'included' | 'excluded' | 'exempt',
    allowDecimal: false,
    isFractional: false,
    fractionalUnit: '',
    hasTax: true
  });

  const [profitMargin, setProfitMargin] = useState(0);
  const [wholesaleProfitMargin, setWholesaleProfitMargin] = useState(0);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        sku: product.sku,
        barcode: product.barcode,
        price: product.price,
        cost: product.cost || 0,
        wholesalePrice: product.wholesalePrice || 0,
        stock: product.stock,
        minStock: product.minStock || 0,
        maxStock: product.maxStock || 0,
        category: product.category,
        taxRate: product.taxRate,
        taxType: product.taxType || 'included',
        allowDecimal: product.allowDecimal || false,
        isFractional: product.isFractional || false,
        fractionalUnit: product.fractionalUnit || '',
        hasTax: product.hasTax !== false
      });
    } else {
      setFormData({
        name: '',
        description: '',
        sku: '',
        barcode: '',
        price: 0,
        cost: 0,
        wholesalePrice: 0,
        stock: 0,
        minStock: 0,
        maxStock: 0,
        category: '',
        taxRate: 18,
        taxType: 'included',
        allowDecimal: false,
        isFractional: false,
        fractionalUnit: '',
        hasTax: true
      });
    }
  }, [product]);

  // Calculate profit margins when cost or prices change
  useEffect(() => {
    if (formData.cost > 0) {
      const retailMargin = ((formData.price - formData.cost) / formData.cost) * 100;
      setProfitMargin(Math.round(retailMargin * 100) / 100);
      
      if (formData.wholesalePrice > 0) {
        const wholesaleMargin = ((formData.wholesalePrice - formData.cost) / formData.cost) * 100;
        setWholesaleProfitMargin(Math.round(wholesaleMargin * 100) / 100);
      }
    }
  }, [formData.cost, formData.price, formData.wholesalePrice]);

  const calculatePriceFromMargin = (margin: number, isWholesale: boolean = false) => {
    if (formData.cost > 0 && margin > 0) {
      const calculatedPrice = formData.cost * (1 + margin / 100);
      const roundedPrice = Math.round(calculatedPrice * 100) / 100;
      
      if (isWholesale) {
        setFormData(prev => ({ ...prev, wholesalePrice: roundedPrice }));
        toast.success(`Precio mayoreo calculado: RD$ ${roundedPrice.toLocaleString()}`);
      } else {
        setFormData(prev => ({ ...prev, price: roundedPrice }));
        toast.success(`Precio de venta calculado: RD$ ${roundedPrice.toLocaleString()}`);
      }
    } else {
      toast.error('Ingrese un costo válido primero');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.barcode) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const productData = {
      ...formData,
      cost: formData.cost || 0,
      hasTax: formData.hasTax
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="barcode">Código de Barras *</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Ej: Electrónicos, Ropa, Alimentos"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Precios y Márgenes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Precios y Márgenes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cost">Costo</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>

                {/* Precio de Venta */}
                <div className="space-y-2">
                  <Label htmlFor="price">Precio de Venta</Label>
                  <div className="flex gap-2">
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const margin = prompt('Ingrese el porcentaje de ganancia deseado:');
                        if (margin && !isNaN(parseFloat(margin))) {
                          calculatePriceFromMargin(parseFloat(margin));
                        }
                      }}
                      className="px-3"
                    >
                      <Percent className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.cost > 0 && formData.price > 0 && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Margen: {profitMargin}%
                    </Badge>
                  )}
                </div>

                {/* Precio Mayoreo */}
                <div className="space-y-2">
                  <Label htmlFor="wholesalePrice">Precio Mayoreo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="wholesalePrice"
                      type="number"
                      step="0.01"
                      value={formData.wholesalePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, wholesalePrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const margin = prompt('Ingrese el porcentaje de ganancia para mayoreo:');
                        if (margin && !isNaN(parseFloat(margin))) {
                          calculatePriceFromMargin(parseFloat(margin), true);
                        }
                      }}
                      className="px-3"
                    >
                      <Percent className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.cost > 0 && formData.wholesalePrice > 0 && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      Margen Mayoreo: {wholesaleProfitMargin}%
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inventario */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inventario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock Actual</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="minStock">Stock Mínimo</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxStock">Stock Máximo</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      value={formData.maxStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxStock: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowDecimal">Permitir Decimales</Label>
                    <Switch
                      id="allowDecimal"
                      checked={formData.allowDecimal}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowDecimal: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isFractional">Producto Fraccionable</Label>
                    <Switch
                      id="isFractional"
                      checked={formData.isFractional}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFractional: checked }))}
                    />
                  </div>
                  
                  {formData.isFractional && (
                    <div>
                      <Label htmlFor="fractionalUnit">Unidad Fraccionable</Label>
                      <Input
                        id="fractionalUnit"
                        value={formData.fractionalUnit}
                        onChange={(e) => setFormData(prev => ({ ...prev, fractionalUnit: e.target.value }))}
                        placeholder="Ej: kg, litros, metros"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Impuestos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuración de Impuestos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasTax">Producto con ITBIS</Label>
                  <Switch
                    id="hasTax"
                    checked={formData.hasTax}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasTax: checked }))}
                  />
                </div>

                {formData.hasTax && (
                  <>
                    <div>
                      <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        value={formData.taxRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="taxType">Tipo de Impuesto</Label>
                      <Select 
                        value={formData.taxType} 
                        onValueChange={(value: 'included' | 'excluded' | 'exempt') => 
                          setFormData(prev => ({ ...prev, taxType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="included">ITBIS Incluido</SelectItem>
                          <SelectItem value="excluded">ITBIS No Incluido</SelectItem>
                          <SelectItem value="exempt">Exento de ITBIS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
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

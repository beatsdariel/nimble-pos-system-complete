
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
import { Calculator, Percent, Package } from 'lucide-react';
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
    price: '',
    cost: '',
    wholesalePrice: '',
    stock: 0,
    minStock: 0,
    maxStock: 0,
    category: '',
    taxRate: 18,
    taxType: 'included' as 'included' | 'excluded' | 'exempt',
    allowDecimal: false,
    isFractional: false,
    fractionalUnit: '',
    hasTax: true,
    unitOfMeasure: 'unidad' as 'libra' | 'unidad' | 'caja'
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
        price: product.price.toString(),
        cost: product.cost ? product.cost.toString() : '',
        wholesalePrice: product.wholesalePrice ? product.wholesalePrice.toString() : '',
        stock: product.stock,
        minStock: product.minStock || 0,
        maxStock: product.maxStock || 0,
        category: product.category,
        taxRate: product.taxRate,
        taxType: product.taxType || 'included',
        allowDecimal: product.allowDecimal || false,
        isFractional: product.isFractional || false,
        fractionalUnit: product.fractionalUnit || '',
        hasTax: product.hasTax !== false,
        unitOfMeasure: product.unitOfMeasure || 'unidad'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        sku: '',
        barcode: '',
        price: '',
        cost: '',
        wholesalePrice: '',
        stock: 0,
        minStock: 0,
        maxStock: 0,
        category: '',
        taxRate: 18,
        taxType: 'included',
        allowDecimal: false,
        isFractional: false,
        fractionalUnit: '',
        hasTax: true,
        unitOfMeasure: 'unidad'
      });
    }
  }, [product]);

  // Calculate profit margins when cost or prices change
  useEffect(() => {
    const costValue = parseFloat(formData.cost) || 0;
    const priceValue = parseFloat(formData.price) || 0;
    const wholesalePriceValue = parseFloat(formData.wholesalePrice) || 0;

    if (costValue > 0) {
      if (priceValue > 0) {
        const retailMargin = ((priceValue - costValue) / costValue) * 100;
        setProfitMargin(Math.round(retailMargin * 100) / 100);
      }
      
      if (wholesalePriceValue > 0) {
        const wholesaleMargin = ((wholesalePriceValue - costValue) / costValue) * 100;
        setWholesaleProfitMargin(Math.round(wholesaleMargin * 100) / 100);
      }
    }
  }, [formData.cost, formData.price, formData.wholesalePrice]);

  const calculatePriceFromMargin = (margin: number, isWholesale: boolean = false) => {
    const costValue = parseFloat(formData.cost) || 0;
    
    if (costValue > 0 && margin > 0) {
      const calculatedPrice = costValue * (1 + margin / 100);
      const roundedPrice = Math.round(calculatedPrice * 100) / 100;
      
      if (isWholesale) {
        setFormData(prev => ({ ...prev, wholesalePrice: roundedPrice.toString() }));
        toast.success(`Precio mayoreo calculado: RD$ ${roundedPrice.toLocaleString()}`);
      } else {
        setFormData(prev => ({ ...prev, price: roundedPrice.toString() }));
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
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0,
      wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-foreground">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="bg-input border-border text-foreground"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-foreground">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku" className="text-foreground">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      required
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="barcode" className="text-foreground">Código de Barras *</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                      required
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-foreground">Categoría</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Ej: Electrónicos, Ropa, Alimentos"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="unitOfMeasure" className="text-foreground">Unidad de Medida</Label>
                    <Select 
                      value={formData.unitOfMeasure} 
                      onValueChange={(value: 'libra' | 'unidad' | 'caja') => 
                        setFormData(prev => ({ ...prev, unitOfMeasure: value }))}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="unidad" className="text-foreground">Unidad</SelectItem>
                        <SelectItem value="libra" className="text-foreground">Libra</SelectItem>
                        <SelectItem value="caja" className="text-foreground">Caja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Precios y Márgenes */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Calculator className="h-5 w-5" />
                  Precios y Márgenes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cost" className="text-foreground">Costo</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                    placeholder="0.00"
                    className="bg-input border-border text-foreground"
                  />
                </div>

                {/* Precio de Venta */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-foreground">Precio de Venta</Label>
                  <div className="flex gap-2">
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      className="flex-1 bg-input border-border text-foreground"
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
                      className="px-3 border-border text-foreground hover:bg-accent"
                    >
                      <Percent className="h-4 w-4" />
                    </Button>
                  </div>
                  {parseFloat(formData.cost) > 0 && parseFloat(formData.price) > 0 && (
                    <Badge variant="outline" className="text-primary border-primary">
                      Margen: {profitMargin}%
                    </Badge>
                  )}
                </div>

                {/* Precio Mayoreo */}
                <div className="space-y-2">
                  <Label htmlFor="wholesalePrice" className="text-foreground">Precio Mayoreo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="wholesalePrice"
                      type="number"
                      step="0.01"
                      value={formData.wholesalePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, wholesalePrice: e.target.value }))}
                      placeholder="0.00"
                      className="flex-1 bg-input border-border text-foreground"
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
                      className="px-3 border-border text-foreground hover:bg-accent"
                    >
                      <Percent className="h-4 w-4" />
                    </Button>
                  </div>
                  {parseFloat(formData.cost) > 0 && parseFloat(formData.wholesalePrice) > 0 && (
                    <Badge variant="outline" className="text-secondary border-secondary">
                      Margen Mayoreo: {wholesaleProfitMargin}%
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inventario */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Package className="h-5 w-5" />
                  Inventario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stock" className="text-foreground">Stock Actual</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="minStock" className="text-foreground">Stock Mínimo</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxStock" className="text-foreground">Stock Máximo</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      value={formData.maxStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxStock: parseInt(e.target.value) || 0 }))}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowDecimal" className="text-foreground">Permitir Decimales</Label>
                    <Switch
                      id="allowDecimal"
                      checked={formData.allowDecimal}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowDecimal: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isFractional" className="text-foreground">Producto Fraccionable</Label>
                    <Switch
                      id="isFractional"
                      checked={formData.isFractional}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFractional: checked }))}
                    />
                  </div>
                  
                  {formData.isFractional && (
                    <div>
                      <Label htmlFor="fractionalUnit" className="text-foreground">Unidad Fraccionable</Label>
                      <Input
                        id="fractionalUnit"
                        value={formData.fractionalUnit}
                        onChange={(e) => setFormData(prev => ({ ...prev, fractionalUnit: e.target.value }))}
                        placeholder="Ej: kg, litros, metros"
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Impuestos */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Configuración de Impuestos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasTax" className="text-foreground">Producto con ITBIS</Label>
                  <Switch
                    id="hasTax"
                    checked={formData.hasTax}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasTax: checked }))}
                  />
                </div>

                {formData.hasTax && (
                  <>
                    <div>
                      <Label htmlFor="taxRate" className="text-foreground">Tasa de Impuesto (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        value={formData.taxRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="taxType" className="text-foreground">Tipo de Impuesto</Label>
                      <Select 
                        value={formData.taxType} 
                        onValueChange={(value: 'included' | 'excluded' | 'exempt') => 
                          setFormData(prev => ({ ...prev, taxType: value }))}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="included" className="text-foreground">ITBIS Incluido</SelectItem>
                          <SelectItem value="excluded" className="text-foreground">ITBIS No Incluido</SelectItem>
                          <SelectItem value="exempt" className="text-foreground">Exento de ITBIS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-foreground hover:bg-accent">
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/80">
              {product ? 'Actualizar' : 'Crear'} Producto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;

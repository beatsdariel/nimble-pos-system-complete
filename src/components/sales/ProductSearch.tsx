
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { Search, Barcode, Plus, Package } from 'lucide-react';
import { Product } from '@/types/pos';

const ProductSearch = () => {
  const { products, addToCart } = usePos();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase()) ||
        product.barcode.includes(value) ||
        product.sku.toLowerCase().includes(value.toLowerCase()) ||
        product.description.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      addToCart(product, 1);
      setSearchTerm('');
      setFilteredProducts([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredProducts.length > 0) {
      handleAddToCart(filteredProducts[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Código de barras, nombre o SKU..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 h-12 text-lg"
            autoFocus
          />
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12">
          <Barcode className="h-5 w-5" />
        </Button>
      </div>

      {/* Search Results */}
      {filteredProducts.length > 0 && (
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredProducts.slice(0, 8).map((product) => (
            <Card 
              key={product.id} 
              className="cursor-pointer hover:shadow-md transition-all hover:bg-blue-50"
              onClick={() => handleAddToCart(product)}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">SKU: {product.sku}</span>
                      <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs">
                        Stock: {product.stock}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      RD$ {product.price.toLocaleString()}
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-1"
                      disabled={product.stock === 0}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product categories for quick access */}
      {searchTerm === '' && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Acceso Rápido</h4>
          <div className="grid grid-cols-2 gap-2">
            {['Medicamentos', 'Bebidas', 'Snacks', 'Cuidado Personal'].map((category) => (
              <Button 
                key={category}
                variant="outline" 
                className="h-12 text-sm"
                onClick={() => handleSearch(category.toLowerCase())}
              >
                <Package className="h-4 w-4 mr-2" />
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;

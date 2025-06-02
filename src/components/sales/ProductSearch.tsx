
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { Search, Barcode, Plus } from 'lucide-react';
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar producto por nombre, código de barras o SKU..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Barcode className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Results */}
      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{product.name}</h3>
                  <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                    Stock: {product.stock}
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-500 mb-2">{product.description}</p>
                <p className="text-xs text-gray-400 mb-3">SKU: {product.sku}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-green-600">
                    RD$ {product.price.toLocaleString()}
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Access Products */}
      {searchTerm === '' && (
        <div>
          <h3 className="text-lg font-medium mb-4">Productos Populares</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 6).map((product) => (
              <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">{product.name}</h3>
                    <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                      Stock: {product.stock}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-green-600">
                      RD$ {product.price.toLocaleString()}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { Search, X, Plus } from 'lucide-react';
import { Product } from '@/types/pos';
import { toast } from 'sonner';

interface CentralProductSearchProps {
  useWholesalePrices: boolean;
  onProductSelect: (product: Product) => void;
}

const CentralProductSearch: React.FC<CentralProductSearchProps> = ({
  useWholesalePrices,
  onProductSelect
}) => {
  const { 
    products, 
    addToCart, 
    processBarcodeCommand,
    lastAddedProductId,
    getProduct
  } = usePos();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    // Check if it's a quantity command (e.g., +2, +0.5)
    if (value.startsWith('+')) {
      // Don't filter products for quantity commands
      setFilteredProducts([]);
      return;
    }

    if (value.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase()) ||
        product.barcode.includes(value) ||
        product.sku.toLowerCase().includes(value.toLowerCase()) ||
        product.description.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, 10)); // Limit to 10 results for performance
    } else {
      setFilteredProducts([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm.trim()) {
        // Process the barcode command or search
        processBarcodeCommand(searchTerm.trim());
        setSearchTerm('');
        setFilteredProducts([]);
      }
    }
    if (e.key === 'Escape') {
      setSearchTerm('');
      setFilteredProducts([]);
    }
  };

  const handleAddToCart = (product: any) => {
    if (product.stock > 0) {
      addToCart(product.id, 1);
      setSearchTerm('');
      setFilteredProducts([]);
      toast.success(`${product.name} agregado al carrito`);
    } else {
      toast.error('Stock insuficiente');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="h-4 w-4" />
        </div>
        <Input
          type="text"
          placeholder="Buscar productos o usar comandos: código, +cantidad (ej: +2, +0.5)..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyPress}
          className="pl-10 pr-4 h-12 text-lg"
          autoComplete="off"
        />
        {searchTerm && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSearchTerm('');
              setFilteredProducts([]);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Status Information */}
      {lastAddedProductId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">
              Último agregado: {getProduct(lastAddedProductId)?.name}
            </span>
          </div>
          <p className="text-green-600 text-sm mt-1">
            Usa +cantidad para modificar este producto (ej: +2, +0.5, +1.25)
          </p>
        </div>
      )}

      {/* Quick Commands Help */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="bg-gray-100 px-2 py-1 rounded">Enter: Procesar comando</span>
        <span className="bg-gray-100 px-2 py-1 rounded">+2: Cambiar cantidad a 2</span>
        <span className="bg-gray-100 px-2 py-1 rounded">+0.5: Cambiar cantidad a 0.5</span>
        <span className="bg-gray-100 px-2 py-1 rounded">Esc: Limpiar</span>
      </div>

      {/* Search Results */}
      {filteredProducts.length > 0 && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Resultados de búsqueda</h3>
              <Badge variant="outline">{filteredProducts.length} encontrados</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {filteredProducts.map((product, index) => (
                <Card key={product.id} className={`cursor-pointer hover:shadow-md transition-shadow ${index === 0 ? 'ring-2 ring-blue-200' : ''}`}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs">
                        {product.stock}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-1">{product.description}</p>
                    <p className="text-xs text-gray-400 mb-2">
                      SKU: {product.sku} | {product.barcode}
                    </p>
                    
                    {(product.allowDecimal || product.isFractional) && (
                      <div className="flex gap-1 mb-2">
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                          Permite decimales
                        </Badge>
                        {product.fractionalUnit && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                            {product.fractionalUnit}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="text-right">
                        <span className="text-sm font-semibold text-green-600">
                          RD$ {(useWholesalePrices && product.wholesalePrice ? product.wholesalePrice : product.price).toLocaleString()}
                        </span>
                        {useWholesalePrices && product.wholesalePrice && (
                          <p className="text-xs text-gray-400 line-through">
                            RD$ {product.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="h-7 px-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
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
                    <div>
                      <span className="text-lg font-semibold text-green-600">
                        RD$ {(useWholesalePrices && product.wholesalePrice ? product.wholesalePrice : product.price).toLocaleString()}
                      </span>
                      {useWholesalePrices && product.wholesalePrice && (
                        <p className="text-xs text-gray-400 line-through">
                          RD$ {product.price.toLocaleString()}
                        </p>
                      )}
                    </div>
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

export default CentralProductSearch;

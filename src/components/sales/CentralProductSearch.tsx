
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { Search, Plus, Barcode } from 'lucide-react';
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
  const { products, addToCart } = usePos();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

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
      setShowResults(true);
      
      // Auto-add if exact barcode match
      const exactBarcodeMatch = products.find(p => p.barcode === value.trim());
      if (exactBarcodeMatch && exactBarcodeMatch.stock > 0) {
        handleQuickAdd(exactBarcodeMatch);
        clearSearch();
      }
    } else {
      setShowResults(false);
    }
  };

  const handleQuickAdd = (product: Product) => {
    if (product.stock > 0) {
      addToCart(product, 1, useWholesalePrices);
      toast.success(`${product.name} agregado al carrito`);
    } else {
      toast.error('Producto sin stock');
    }
  };

  const handleProductClick = (product: Product) => {
    onProductSelect(product);
    clearSearch();
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
    setFilteredProducts([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredProducts.length > 0) {
      handleQuickAdd(filteredProducts[0]);
      clearSearch();
    }
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          ref={searchInputRef}
          placeholder="Buscar productos por nombre, código de barras o SKU... (Enter = Agregar rápido)"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyPress}
          className="pl-12 pr-12 h-12 text-base bg-white border-2 border-gray-300 focus:border-blue-500 rounded-lg"
          autoComplete="off"
        />
        <Barcode className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-2 border-gray-200 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
              <span className="font-medium text-gray-700">
                Resultados de búsqueda ({filteredProducts.length})
              </span>
              <Button size="sm" variant="ghost" onClick={clearSearch}>
                Cerrar
              </Button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                      index === 0 ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-1">{product.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>SKU: {product.sku}</span>
                          <span>Código: {product.barcode}</span>
                          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                            Stock: {product.stock}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-green-600">
                          RD$ {(useWholesalePrices && product.wholesalePrice ? product.wholesalePrice : product.price).toLocaleString()}
                        </div>
                        {useWholesalePrices && product.wholesalePrice && (
                          <div className="text-sm text-gray-400 line-through">
                            RD$ {product.price.toLocaleString()}
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAdd(product);
                              clearSearch();
                            }}
                            disabled={product.stock === 0}
                            className="h-7 px-2"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {index === 0 ? 'Enter' : 'Agregar'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron productos</p>
                  <p className="text-sm">Intenta con otro término de búsqueda</p>
                </div>
              )}
            </div>
            
            {filteredProducts.length > 0 && (
              <div className="bg-gray-50 px-4 py-2 border-t text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Enter: Agregar primer resultado rápidamente</span>
                  <span>Esc: Cerrar búsqueda</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CentralProductSearch;

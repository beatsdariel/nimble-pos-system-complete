
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { Search, Package, Plus, Minus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface CentralProductSearchProps {
  useWholesalePrices: boolean;
  onProductSelect?: (product: any) => void;
}

const CentralProductSearch: React.FC<CentralProductSearchProps> = ({
  useWholesalePrices,
  onProductSelect
}) => {
  const { products, addToCart } = usePos();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm, products]);

  const handleAddToCart = (product: any, quantity: number = 1) => {
    if (product.stock < quantity) {
      toast.error(`Stock insuficiente. Disponible: ${product.stock}`);
      return;
    }

    addToCart(product, quantity, useWholesalePrices);
    toast.success(`${product.name} agregado al carrito (${quantity})`);
    
    // Clear search and results
    setSearchTerm('');
    setShowResults(false);
    setQuantities({});
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    const currentQty = quantities[productId] || 1;
    const newQty = Math.max(1, currentQty + delta);
    const product = products.find(p => p.id === productId);
    
    if (product && newQty <= product.stock) {
      setQuantities(prev => ({
        ...prev,
        [productId]: newQty
      }));
    } else if (product) {
      toast.error(`Stock máximo disponible: ${product.stock}`);
    }
  };

  const getDisplayPrice = (product: any) => {
    if (useWholesalePrices && product.wholesalePrice) {
      return product.wholesalePrice;
    }
    return product.price;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchResults.length === 1) {
      handleAddToCart(searchResults[0]);
    }
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Buscar por nombre, código de barras, SKU o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-4 py-3 text-lg"
          autoFocus
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setShowResults(false);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            ✕
          </Button>
        )}
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {searchResults.map((product) => {
              const quantity = quantities[product.id] || 1;
              const displayPrice = getDisplayPrice(product);
              const isOutOfStock = product.stock === 0;
              const isLowStock = product.stock <= product.minStock && product.stock > 0;

              return (
                <div
                  key={product.id}
                  className={`p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                    isOutOfStock ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              SKU: {product.sku}
                            </span>
                            <span className="text-xs text-gray-400">
                              Código: {product.barcode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock and Price Info */}
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            RD$ {displayPrice.toLocaleString()}
                          </span>
                          {useWholesalePrices && product.wholesalePrice && (
                            <Badge variant="secondary" className="text-xs">
                              Mayoreo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            Stock: {product.stock}
                          </span>
                          {isLowStock && (
                            <Badge variant="destructive" className="text-xs">
                              Bajo Stock
                            </Badge>
                          )}
                          {isOutOfStock && (
                            <Badge variant="destructive" className="text-xs">
                              Agotado
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      {!isOutOfStock && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            disabled={quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            disabled={quantity >= product.stock}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <Button
                        onClick={() => handleAddToCart(product, quantity)}
                        disabled={isOutOfStock}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {showResults && searchResults.length === 0 && searchTerm.trim().length >= 2 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
          <CardContent className="p-4 text-center text-gray-500">
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No se encontraron productos</p>
            <p className="text-sm">Intenta con otro término de búsqueda</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CentralProductSearch;

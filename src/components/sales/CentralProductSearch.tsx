
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { Search, Package, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import QuantityInput from './QuantityInput';

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
    const minQuantity = product.allowDecimal || product.isFractional ? 0.1 : 1;
    const finalQuantity = Math.max(quantity, minQuantity);
    
    if (product.stock < finalQuantity) {
      toast.error(`Stock insuficiente. Disponible: ${product.stock}`);
      return;
    }

    addToCart(product, finalQuantity, useWholesalePrices);
    
    const displayQuantity = product.allowDecimal || product.isFractional 
      ? finalQuantity.toFixed(1) 
      : finalQuantity.toString();
    const unit = product.fractionalUnit ? ` ${product.fractionalUnit}` : '';
    
    toast.success(`${product.name} agregado al carrito (${displayQuantity}${unit})`);
    
    // Clear search and results
    setSearchTerm('');
    setShowResults(false);
    setQuantities({});
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    
    if (product && newQuantity <= product.stock) {
      setQuantities(prev => ({
        ...prev,
        [productId]: newQuantity
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
      const product = searchResults[0];
      const quantity = quantities[product.id] || (product.allowDecimal || product.isFractional ? 1.0 : 1);
      handleAddToCart(product, quantity);
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
              const allowDecimal = product.allowDecimal || product.isFractional;
              const defaultQuantity = allowDecimal ? 1.0 : 1;
              const quantity = quantities[product.id] || defaultQuantity;
              const displayPrice = getDisplayPrice(product);
              const isOutOfStock = product.stock === 0;
              const isLowStock = product.stock <= product.minStock && product.stock > 0;
              const step = allowDecimal ? 0.1 : 1;
              const min = allowDecimal ? 0.1 : 1;

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
                          <div className="flex flex-col gap-1">
                            {useWholesalePrices && product.wholesalePrice && (
                              <Badge variant="secondary" className="text-xs">
                                Mayoreo
                              </Badge>
                            )}
                            {allowDecimal && (
                              <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                                Decimal
                              </Badge>
                            )}
                            {product.fractionalUnit && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                {product.fractionalUnit}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            Stock: {allowDecimal ? product.stock.toFixed(1) : product.stock}
                            {product.fractionalUnit ? ` ${product.fractionalUnit}` : ''}
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
                        <QuantityInput
                          value={quantity}
                          onChange={(newQuantity) => handleQuantityChange(product.id, newQuantity)}
                          max={product.stock}
                          min={min}
                          step={step}
                          allowDecimal={allowDecimal}
                        />
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

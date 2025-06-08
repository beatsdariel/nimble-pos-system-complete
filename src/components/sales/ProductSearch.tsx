
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { Search, X, Plus, Eye } from 'lucide-react';
import { Product } from '@/types/pos';
import { toast } from 'sonner';

interface ProductSearchProps {
  onAddToCart: (productId: string, quantity: number) => void;
  useWholesalePrices: boolean;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onAddToCart, useWholesalePrices }) => {
  const { products } = usePos();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus on search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    // Check if it's a quantity command (e.g., +2, +5)
    const quantityMatch = value.match(/^\+(\d+)$/);
    if (quantityMatch) {
      const quantity = parseInt(quantityMatch[1]);
      handleQuantityCommand(quantity);
      return;
    }

    if (value.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase()) ||
        product.barcode.includes(value) ||
        product.sku.toLowerCase().includes(value.toLowerCase()) ||
        product.description.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
      
      // Auto-add to cart if exact barcode match
      const exactBarcodeMatch = products.find(p => p.barcode === value.trim());
      if (exactBarcodeMatch && exactBarcodeMatch.stock > 0) {
        handleAddToCart(exactBarcodeMatch, 1);
        setSearchTerm('');
        setFilteredProducts([]);
        toast.success(`${exactBarcodeMatch.name} agregado al carrito`);
      }
    } else {
      setFilteredProducts([]);
    }
  };

  const handleQuantityCommand = (quantity: number) => {
    // Get the last added product from recent searches or filtered products
    if (filteredProducts.length > 0) {
      const product = filteredProducts[0];
      if (product.stock >= quantity) {
        onAddToCart(product.id, quantity);
        toast.success(`${quantity} unidades de ${product.name} agregadas`);
      } else {
        toast.error('Stock insuficiente');
      }
    } else {
      toast.info('Busca un producto primero, luego usa +cantidad');
    }
    setSearchTerm('');
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (product.stock >= quantity) {
      onAddToCart(product.id, quantity);
      setSearchTerm('');
      setFilteredProducts([]);
    } else {
      toast.error('Stock insuficiente');
    }
  };

  const handleViewPrice = (product: Product) => {
    const price = useWholesalePrices && product.wholesalePrice ? product.wholesalePrice : product.price;
    toast.info(`${product.name}: RD$ ${price.toLocaleString()}`, {
      duration: 3000,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredProducts.length > 0) {
      handleAddToCart(filteredProducts[0]);
    }
    if (e.key === 'Escape') {
      setSearchTerm('');
      setFilteredProducts([]);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredProducts([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    toast.info('Modo escaneo activado - escanea el código de barras');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input with Barcode Scanner */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={searchInputRef}
            placeholder="Buscar por nombre, código de barras, SKU... o usa +cantidad"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyPress}
            className={`pl-10 pr-10 ${isScanning ? 'border-green-500 ring-2 ring-green-200' : ''}`}
            autoComplete="off"
          />
          {searchTerm && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button 
          variant={isScanning ? "default" : "outline"} 
          onClick={startScanning}
          className="px-4"
        >
          {isScanning ? 'Escaneando...' : 'Escanear'}
        </Button>
      </div>

      {/* Quick Commands Help */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="bg-gray-100 px-2 py-1 rounded">Enter: Agregar primer resultado</span>
        <span className="bg-blue-100 px-2 py-1 rounded text-blue-700">👁️ Ver precio</span>
        <span className="bg-green-100 px-2 py-1 rounded text-green-700">+2: Agregar 2 unidades</span>
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
                    
                    <div className="text-center mb-3">
                      <span className="text-sm font-semibold text-green-600">
                        RD$ {(useWholesalePrices && product.wholesalePrice ? product.wholesalePrice : product.price).toLocaleString()}
                      </span>
                      {useWholesalePrices && product.wholesalePrice && (
                        <p className="text-xs text-gray-400 line-through">
                          RD$ {product.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewPrice(product)}
                        className="flex-1 h-7 px-2"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 h-7 px-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {index === 0 ? 'Enter' : 'Agregar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductSearch;

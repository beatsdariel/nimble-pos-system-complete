
import React from 'react';
import { Button } from '@/components/ui/button';
import { usePos } from '@/contexts/PosContext';
import { Trash2, AlertTriangle } from 'lucide-react';
import QuantityInput from './QuantityInput';
import { Badge } from '@/components/ui/badge';

const ShoppingCart = () => {
  const { cart, updateCartQuantity, removeFromCart, cartSubtotal, cartTax, cartTotal, getProduct } = usePos();

  if (cart.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>El carrito está vacío</p>
        <p className="text-sm">Busca y agrega productos para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Cart Items - Fixed height with controlled scroll */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
        {cart.map((item) => {
          const product = getProduct(item.productId);
          const allowDecimal = product?.allowDecimal || product?.isFractional || false;
          const step = allowDecimal ? 0.1 : 1;
          const min = allowDecimal ? 0.1 : 1;
          const isOverStock = product && item.quantity > product.stock;

          return (
            <div key={item.productId} className={`grid grid-cols-12 gap-2 p-3 rounded-lg border ${isOverStock ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              {/* Quantity Column - Fixed width */}
              <div className="col-span-2 flex items-center">
                <QuantityInput
                  value={item.quantity}
                  onChange={(newQuantity) => updateCartQuantity(item.productId, newQuantity)}
                  max={product?.stock || 999999}
                  min={min}
                  step={step}
                  allowDecimal={allowDecimal}
                />
              </div>
              
              {/* Product Info Column - Flexible width with proper truncation */}
              <div className="col-span-6 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{item.name}</h4>
                  {isOverStock && (
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-1">
                  RD$ {item.price.toLocaleString()} c/u
                </p>
                <div className="flex flex-wrap gap-1">
                  {allowDecimal && (
                    <Badge variant="outline" className="text-xs text-blue-600">Decimales</Badge>
                  )}
                  {product && (
                    <Badge variant={isOverStock ? "destructive" : "secondary"} className="text-xs">
                      Stock: {product.stock}
                    </Badge>
                  )}
                  {isOverStock && (
                    <Badge variant="destructive" className="text-xs">
                      ¡Excede stock!
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Price Column - Fixed width */}
              <div className="col-span-2 flex items-center justify-center">
                <span className="font-medium text-sm text-center">
                  RD$ {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
              
              {/* Actions Column - Fixed width */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFromCart(item.productId)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 flex-shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary - Always visible at bottom */}
      <div className="space-y-2 pt-4 border-t flex-shrink-0 bg-white">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>RD$ {cartSubtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>ITBIS (18%):</span>
          <span>RD$ {cartTax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold pt-2 border-t">
          <span>Total:</span>
          <span>RD$ {cartTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;

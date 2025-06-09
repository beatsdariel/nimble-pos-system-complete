
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
    <div className="space-y-4 max-h-96 flex flex-col">
      {/* Cart Items with controlled height and scroll */}
      <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
        {cart.map((item) => {
          const product = getProduct(item.productId);
          const allowDecimal = product?.allowDecimal || product?.isFractional || false;
          const step = allowDecimal ? 0.1 : 1;
          const min = allowDecimal ? 0.1 : 1;
          const isOverStock = product && item.quantity > product.stock;

          return (
            <div key={item.productId} className={`flex items-center gap-2 p-3 rounded-lg ${isOverStock ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">{item.name}</h4>
                  {isOverStock && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  RD$ {item.price.toLocaleString()} c/u
                </p>
                <div className="flex gap-1 mt-1">
                  {allowDecimal && (
                    <Badge variant="outline" className="text-xs text-blue-600">Permite decimales</Badge>
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
              
              <QuantityInput
                value={item.quantity}
                onChange={(newQuantity) => updateCartQuantity(item.productId, newQuantity)}
                max={product?.stock || 999999}
                min={min}
                step={step}
                allowDecimal={allowDecimal}
              />
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeFromCart(item.productId)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              
              <div className="text-right min-w-0">
                <p className="font-medium text-sm">
                  RD$ {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary - Always visible */}
      <div className="space-y-2 pt-4 border-t flex-shrink-0">
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

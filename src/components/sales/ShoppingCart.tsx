
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePos } from '@/contexts/PosContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

const ShoppingCart = () => {
  const { cart, updateCartQuantity, removeFromCart, cartSubtotal, cartTax, cartTotal } = usePos();

  if (cart.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>El carrito está vacío</p>
        <p className="text-sm">Busca y agrega productos para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cart Items */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.productId} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              <p className="text-xs text-gray-500">
                RD$ {item.price.toLocaleString()} c/u
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateCartQuantity(item.productId, parseInt(e.target.value) || 1)}
                className="w-16 h-8 text-center text-sm"
                min="1"
              />
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeFromCart(item.productId)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="text-right min-w-0">
              <p className="font-medium text-sm">
                RD$ {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="space-y-2 pt-4 border-t">
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

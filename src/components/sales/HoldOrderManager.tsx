
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Clock, User, DollarSign, Trash2, Play } from 'lucide-react';
import { CartItem } from '@/types/pos';

interface HoldOrder {
  id: string;
  customerName: string;
  items: CartItem[];
  total: number;
  createdAt: string;
}

interface HoldOrderManagerProps {
  open: boolean;
  onClose: () => void;
  onResumeOrder: (order: HoldOrder) => void;
}

const HoldOrderManager: React.FC<HoldOrderManagerProps> = ({
  open,
  onClose,
  onResumeOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [holdOrders] = useState<HoldOrder[]>([
    {
      id: 'HOLD-001',
      customerName: 'Juan Pérez',
      items: [
        { productId: '1', name: 'Café Premium', price: 350, quantity: 2, taxRate: 0.18, isWholesalePrice: false },
        { productId: '2', name: 'Agua Mineral', price: 25, quantity: 3, taxRate: 0.18, isWholesalePrice: false }
      ],
      total: 775,
      createdAt: new Date().toISOString()
    },
    {
      id: 'HOLD-002',
      customerName: 'María García',
      items: [
        { productId: '3', name: 'Pan Tostado', price: 85, quantity: 1, taxRate: 0.18, isWholesalePrice: false }
      ],
      total: 100.3,
      createdAt: new Date().toISOString()
    }
  ]);

  const filteredOrders = holdOrders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResumeOrder = (order: HoldOrder) => {
    onResumeOrder(order);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pedidos Abiertos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por cliente o número de pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Orders List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay pedidos abiertos</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{order.id}</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{order.customerName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold">
                          <DollarSign className="h-4 w-4" />
                          RD$ {order.total.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-500">
                          {order.items.length} artículo(s)
                        </p>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="space-y-1 mb-3">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>RD$ {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{order.items.length - 3} artículo(s) más...
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleResumeOrder(order)}
                        className="flex-1"
                      >
                        <Play className="h-3 w-3 mr-2" />
                        Resumir Pedido
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Handle delete order
                          console.log('Delete order:', order.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HoldOrderManager;

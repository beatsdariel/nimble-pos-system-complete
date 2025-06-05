
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Clock, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';

interface HoldOrder {
  id: string;
  customerName: string;
  customerId?: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  holdDate: string;
  holdTime: string;
  userId: string;
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
  const [holdOrders, setHoldOrders] = useState<HoldOrder[]>([
    {
      id: 'HOLD-001',
      customerName: 'CONSUMIDOR FINAL',
      items: [
        { productId: '1', name: 'Café Premium', price: 350, quantity: 2 },
        { productId: '2', name: 'Agua Mineral 500ml', price: 25, quantity: 3 }
      ],
      total: 775,
      holdDate: new Date().toLocaleDateString(),
      holdTime: '10:30 AM',
      userId: 'user1'
    },
    {
      id: 'HOLD-002',
      customerName: 'Juan Pérez',
      customerId: '1',
      items: [
        { productId: '3', name: 'Pan Tostado', price: 70, quantity: 1 },
        { productId: '4', name: 'Refresco Cola 355ml', price: 38, quantity: 2 }
      ],
      total: 146,
      holdDate: new Date().toLocaleDateString(),
      holdTime: '11:15 AM',
      userId: 'user1'
    }
  ]);

  const filteredOrders = holdOrders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResumeOrder = (order: HoldOrder) => {
    onResumeOrder(order);
    setHoldOrders(prev => prev.filter(o => o.id !== order.id));
    toast.success(`Pedido ${order.id} reanudado`);
    onClose();
  };

  const handleDeleteOrder = (orderId: string) => {
    setHoldOrders(prev => prev.filter(o => o.id !== orderId));
    toast.success('Pedido eliminado');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gestionar Pedidos Abiertos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por cliente o número de pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{holdOrders.length}</div>
                <div className="text-sm text-gray-600">Pedidos Abiertos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  RD$ {holdOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Valor Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {holdOrders.reduce((sum, order) => sum + order.items.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Items Totales</div>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{order.id}</h3>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {order.holdTime}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Cliente: {order.customerName}</p>
                      <p className="text-sm text-gray-500">Fecha: {order.holdDate}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        RD$ {order.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} item(s)
                      </div>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h4 className="text-sm font-medium mb-2">Artículos:</h4>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span>{item.quantity}x {item.name}</span>
                          <span>RD$ {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-xs text-gray-500">
                          ... y {order.items.length - 3} artículo(s) más
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleResumeOrder(order)}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Reanudar Pedido
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteOrder(order.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>
                {searchTerm ? 'No se encontraron pedidos' : 'No hay pedidos abiertos'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HoldOrderManager;

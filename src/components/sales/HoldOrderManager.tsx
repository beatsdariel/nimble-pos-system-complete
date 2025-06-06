
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeldOrder } from '@/types/pos';
import { Clock, ShoppingCart, User, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';

interface HoldOrderManagerProps {
  open: boolean;
  onClose: () => void;
  onResumeOrder: (order: HeldOrder) => void;
}

const HoldOrderManager: React.FC<HoldOrderManagerProps> = ({
  open,
  onClose,
  onResumeOrder
}) => {
  // Sample held orders - in real app this would come from context
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([
    {
      id: 'HOLD-001',
      items: [
        { productId: '1', name: 'Café Premium', price: 350, quantity: 2, taxRate: 0.18 },
        { productId: '2', name: 'Agua Mineral', price: 25, quantity: 1, taxRate: 0.18 }
      ],
      customerId: '1',
      total: 725,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      createdBy: 'ADMIN',
      note: 'Cliente esperando'
    },
    {
      id: 'HOLD-002',
      items: [
        { productId: '3', name: 'Pan Tostado', price: 85, quantity: 3, taxRate: 0.18 }
      ],
      total: 255,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      createdBy: 'ADMIN',
      note: 'Revisar inventario'
    }
  ]);

  const handleResumeOrder = (order: HeldOrder) => {
    onResumeOrder(order);
    setHeldOrders(prev => prev.filter(o => o.id !== order.id));
    toast.success(`Pedido ${order.id} reanudado`);
    onClose();
  };

  const handleDeleteOrder = (orderId: string) => {
    setHeldOrders(prev => prev.filter(o => o.id !== orderId));
    toast.success('Pedido eliminado');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return `${diffHours}h ${diffMinutes % 60}m`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pedidos Abiertos ({heldOrders.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {heldOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay pedidos abiertos</p>
              <p className="text-sm">Los pedidos guardados aparecerán aquí</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {heldOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        {order.id}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(order.createdAt)}
                        </Badge>
                        <Badge variant="outline">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} ítems
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <div className="flex-1">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                          </div>
                          <span className="font-medium">
                            RD$ {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Creado por:</span>
                        <div className="font-medium flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {order.createdBy}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <div className="font-bold text-lg text-green-600">
                          RD$ {order.total.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {order.note && (
                      <div className="bg-yellow-50 p-2 rounded">
                        <span className="text-sm text-gray-600">Nota: </span>
                        <span className="text-sm font-medium">{order.note}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        onClick={() => handleResumeOrder(order)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Reanudar Pedido
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HoldOrderManager;

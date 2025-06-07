
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { Clock, ShoppingCart, User, Trash2, Play, Search } from 'lucide-react';
import { toast } from 'sonner';

interface HoldOrderManagerProps {
  open: boolean;
  onClose: () => void;
}

const HoldOrderManager: React.FC<HoldOrderManagerProps> = ({
  open,
  onClose
}) => {
  const { heldOrders, resumeHeldOrder, deleteHeldOrder, searchHeldOrders } = usePos();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = searchTerm.trim() 
    ? searchHeldOrders(searchTerm)
    : heldOrders;

  const handleResumeOrder = (orderId: string) => {
    resumeHeldOrder(orderId);
    onClose();
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteHeldOrder(orderId);
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
            Pedidos Abiertos ({filteredOrders.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por ID, nota o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                {searchTerm ? 'No se encontraron pedidos' : 'No hay pedidos abiertos'}
              </p>
              <p className="text-sm">
                {searchTerm ? 'Intente con otros términos de búsqueda' : 'Los pedidos guardados aparecerán aquí'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
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
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <div className="flex-1">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                            {item.isWholesalePrice && (
                              <Badge variant="secondary" className="text-xs ml-2">Mayoreo</Badge>
                            )}
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
                        onClick={() => handleResumeOrder(order.id)}
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

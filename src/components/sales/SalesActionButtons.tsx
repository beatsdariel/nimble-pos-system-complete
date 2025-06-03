
import React from 'react';
import { Button } from '@/components/ui/button';
import { usePos } from '@/contexts/PosContext';
import { 
  CreditCard, 
  UserPlus, 
  Search, 
  Package, 
  FileText, 
  RotateCcw,
  Pause,
  ArrowRight
} from 'lucide-react';

interface SalesActionButtonsProps {
  onCheckout: () => void;
}

const SalesActionButtons: React.FC<SalesActionButtonsProps> = ({ onCheckout }) => {
  const { cart, clearCart } = usePos();

  const handleSuspendSale = () => {
    // Implementar suspender venta
    console.log('Suspender venta');
  };

  const handleSearchOrder = () => {
    // Implementar buscar pedido
    console.log('Buscar pedido');
  };

  const handleAssignCustomer = () => {
    // Implementar asignar cliente
    console.log('Asignar cliente');
  };

  const handleInsertItem = () => {
    // Implementar insertar artículo
    console.log('Insertar artículo');
  };

  const handleDeleteLine = () => {
    // Implementar borrar línea
    console.log('Borrar línea');
  };

  const handleReturn = () => {
    // Implementar retorno
    console.log('Procesar retorno');
  };

  return (
    <div className="space-y-4">
      {/* Resumen de cuenta */}
      <div className="bg-orange-100 rounded-lg p-3">
        <Button 
          variant="outline" 
          className="w-full bg-orange-200 border-orange-300 text-orange-800 hover:bg-orange-300"
        >
          <FileText className="h-4 w-4 mr-2" />
          RESUMIR CUENTA
        </Button>
      </div>

      {/* Asignar cliente */}
      <Button 
        variant="outline" 
        className="w-full bg-gray-100 hover:bg-gray-200"
        onClick={handleAssignCustomer}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        ASIGNAR CLIENTE
      </Button>

      {/* Dejar pedido abierto */}
      <Button 
        variant="outline" 
        className="w-full bg-gray-100 hover:bg-gray-200"
        onClick={handleSuspendSale}
      >
        <Pause className="h-4 w-4 mr-2" />
        DEJAR PEDIDO ABIERTO / HOLD
      </Button>

      {/* Buscar pedido */}
      <Button 
        variant="outline" 
        className="w-full bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200"
        onClick={handleSearchOrder}
      >
        <Search className="h-4 w-4 mr-2" />
        BUSCAR PEDIDO
      </Button>

      {/* Tabs de navegación */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Button variant="outline" className="bg-gray-200 text-gray-700">
          GENERAL
        </Button>
        <Button variant="outline" className="bg-blue-200 text-blue-800">
          ARTICULO(S)
        </Button>
        <Button variant="outline" className="bg-gray-100">
          DETALLES
        </Button>
      </div>

      {/* Botones de acción principales */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={onCheckout}
          disabled={cart.length === 0}
        >
          <CreditCard className="h-4 w-4 mr-1" />
          COBRAR CUENTA (END)
        </Button>
        
        <Button 
          variant="destructive"
          onClick={handleDeleteLine}
        >
          BORRAR LÍNEA
        </Button>
        
        <Button 
          className="bg-teal-600 hover:bg-teal-700 text-white"
          onClick={handleInsertItem}
        >
          <Package className="h-4 w-4 mr-1" />
          INSERTAR ARTÍCULO
        </Button>
        
        <Button 
          className="bg-orange-600 hover:bg-orange-700 text-white"
          onClick={handleReturn}
        >
          <ArrowRight className="h-4 w-4 mr-1" />
          RETORNAR
        </Button>
      </div>
    </div>
  );
};

export default SalesActionButtons;

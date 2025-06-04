
import React, { useState } from 'react';
import { usePos } from '@/contexts/PosContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Search, List, RotateCcw, Receipt, ShoppingCart } from 'lucide-react';
import ReturnModal from '@/components/returns/ReturnModal';

interface SalesHistoryProps {
  open: boolean;
  onClose: () => void;
  onSelectReturn: (returnAmount: number, returnId: string) => void;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ open, onClose, onSelectReturn }) => {
  const { sales } = usePos();
  const [searchTerm, setSearchTerm] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const handleSelectSale = (sale: any) => {
    setSelectedSale(sale);
    setShowReturnModal(true);
  };

  const filteredSales = sales.filter(sale => 
    sale.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort sales by date, newest first
  const sortedSales = [...filteredSales].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Completada</span>;
      case 'credit':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Crédito</span>;
      case 'paid-credit':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Crédito Pagado</span>;
      case 'returned':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Devuelta</span>;
      case 'partially-returned':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Devolución Parcial</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{status}</span>;
    }
  };

  const handleReturn = (returnData: { returnId: string, returnTotal: number }) => {
    setShowReturnModal(false);
    onSelectReturn(returnData.returnTotal, returnData.returnId);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Historial de Ventas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por número de recibo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Recibo</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSales.length > 0 ? (
                    sortedSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{format(new Date(sale.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell>{sale.receiptNumber}</TableCell>
                        <TableCell>RD$ {sale.total.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(sale.status)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" className="h-8 px-2">
                            <Receipt className="h-4 w-4" />
                          </Button>
                          {sale.status !== 'returned' && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 text-amber-600 hover:text-amber-700"
                              onClick={() => handleSelectSale(sale)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No se encontraron ventas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ReturnModal 
        open={showReturnModal} 
        onClose={() => setShowReturnModal(false)} 
        sale={selectedSale}
      />
    </>
  );
};

export default SalesHistory;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePos } from '@/contexts/PosContext';
import { ShoppingCart, Printer, FileDown, Search } from 'lucide-react';

const SalesDetailReport = () => {
  const { sales, products } = usePos();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Flatten all sale items with sale details
  const allSaleItems = sales.flatMap(sale => 
    sale.items.map(item => ({
      ...item,
      saleId: sale.id,
      saleDate: sale.date,
      customerName: sale.customerName || 'Cliente General',
      paymentMethod: sale.paymentMethod
    }))
  );

  const filteredItems = allSaleItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const itemDate = new Date(item.saleDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const matchesDate = (!start || itemDate >= start) && (!end || itemDate <= end);
    
    return matchesSearch && matchesDate;
  });

  const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Buscar Producto</label>
              <Input
                placeholder="Nombre del producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Artículos</p>
              <p className="text-2xl font-bold text-blue-600">{filteredItems.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Cantidad Total</p>
              <p className="text-2xl font-bold text-orange-600">{totalQuantity}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Monto Total</p>
              <p className="text-2xl font-bold text-green-600">
                RD$ {totalAmount.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Detalle de Ventas por Artículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unit.</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Método Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item, index) => (
                <TableRow key={`${item.saleId}-${item.productId}-${index}`}>
                  <TableCell className="font-medium">{item.saleId}</TableCell>
                  <TableCell>{new Date(item.saleDate).toLocaleDateString()}</TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>RD$ {item.price.toLocaleString()}</TableCell>
                  <TableCell>RD$ {(item.price * item.quantity).toLocaleString()}</TableCell>
                  <TableCell>{item.paymentMethod}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDetailReport;

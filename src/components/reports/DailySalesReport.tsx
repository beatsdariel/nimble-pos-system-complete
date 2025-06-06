
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePos } from '@/contexts/PosContext';
import { Calendar, TrendingUp, Printer, FileDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DailySalesReport = () => {
  const { sales } = usePos();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Group sales by day
  const dailySalesData = sales.reduce((acc, sale) => {
    const dateKey = new Date(sale.date).toLocaleDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        transactions: 0,
        totalAmount: 0,
        totalTax: 0,
        totalItems: 0
      };
    }
    acc[dateKey].transactions += 1;
    acc[dateKey].totalAmount += sale.total;
    acc[dateKey].totalTax += sale.tax;
    acc[dateKey].totalItems += sale.items.reduce((sum, item) => sum + item.quantity, 0);
    return acc;
  }, {} as Record<string, any>);

  const dailyData = Object.values(dailySalesData).filter(day => {
    if (!startDate || !endDate) return true;
    const dayDate = new Date(day.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return dayDate >= start && dayDate <= end;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalSales = dailyData.reduce((sum, day) => sum + day.totalAmount, 0);
  const totalTransactions = dailyData.reduce((sum, day) => sum + day.transactions, 0);
  const averageDaily = dailyData.length > 0 ? totalSales / dailyData.length : 0;

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período de Análisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Días Analizados</p>
              <p className="text-2xl font-bold text-blue-600">{dailyData.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-green-600">
                RD$ {totalSales.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Transacciones</p>
              <p className="text-2xl font-bold text-purple-600">{totalTransactions}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Promedio Diario</p>
              <p className="text-2xl font-bold text-orange-600">
                RD$ {averageDaily.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Gráfico de Ventas Diarias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`RD$ ${Number(value).toLocaleString()}`, 'Ventas']} />
              <Bar dataKey="totalAmount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Detallado por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Transacciones</TableHead>
                <TableHead>Total Artículos</TableHead>
                <TableHead>ITBIS</TableHead>
                <TableHead>Total Ventas</TableHead>
                <TableHead>Promedio por Transacción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyData.map((day, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{day.date}</TableCell>
                  <TableCell>{day.transactions}</TableCell>
                  <TableCell>{day.totalItems}</TableCell>
                  <TableCell>RD$ {day.totalTax.toLocaleString()}</TableCell>
                  <TableCell>RD$ {day.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>RD$ {(day.totalAmount / day.transactions).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySalesReport;

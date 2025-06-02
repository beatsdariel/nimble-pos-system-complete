
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePos } from '@/contexts/PosContext';
import { BarChart3, TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const { sales, products, customers } = usePos();

  // Sales analytics
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = sales.length;
  const averageTicket = totalRevenue / (totalTransactions || 1);

  // Daily sales data for chart
  const dailySales = sales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(dailySales).map(([date, amount]) => ({
    date,
    amount
  }));

  // Top selling products
  const productSales = sales.flatMap(sale => sale.items).reduce((acc, item) => {
    acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productSales)
    .map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return { product: product?.name || 'Producto eliminado', quantity };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Low stock products
  const lowStockProducts = products.filter(product => 
    product.stock <= product.minStock
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis y estadísticas del negocio</p>
        </div>

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sales">Ventas</TabsTrigger>
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            {/* Sales Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                      <p className="text-2xl font-bold text-green-600">
                        RD$ {totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Transacciones</p>
                      <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                      <p className="text-2xl font-bold text-purple-600">
                        RD$ {averageTicket.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Ventas por Día</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`RD$ ${Number(value).toLocaleString()}`, 'Ventas']} />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Productos Más Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-500">#{index + 1}</span>
                        <span className="font-medium">{item.product}</span>
                      </div>
                      <span className="font-semibold text-blue-600">
                        {item.quantity} unidades
                      </span>
                    </div>
                  ))}
                  {topProducts.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No hay datos de ventas disponibles
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            {/* Inventory Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Productos</p>
                      <p className="text-2xl font-bold text-blue-600">{products.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                      <p className="text-2xl font-bold text-red-600">{lowStockProducts.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Low Stock Products */}
            <Card>
              <CardHeader>
                <CardTitle>Productos con Stock Bajo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">{product.stock} unidades</p>
                        <p className="text-xs text-gray-500">Mín: {product.minStock}</p>
                      </div>
                    </div>
                  ))}
                  {lowStockProducts.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      Todos los productos tienen stock suficiente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            {/* Customer Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                      <p className="text-2xl font-bold text-green-600">{customers.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                      <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer List */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email || customer.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {customer.document && `Doc: ${customer.document}`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {customers.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No hay clientes registrados
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;

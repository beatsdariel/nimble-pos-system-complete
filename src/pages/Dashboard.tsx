
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePos } from '@/contexts/PosContext';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const { sales, products, customers } = usePos();

  // Calculate today's sales
  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => 
    new Date(sale.date).toDateString() === today
  );
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  // Calculate low stock products
  const lowStockProducts = products.filter(product => 
    product.stock <= product.minStock
  );

  const stats = [
    {
      title: 'Ventas de Hoy',
      value: `RD$ ${todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Transacciones',
      value: todaySales.length.toString(),
      icon: ShoppingBag,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Productos',
      value: products.length.toString(),
      icon: Package,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Clientes',
      value: customers.length.toString(),
      icon: Users,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen general del sistema POS</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ventas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sales.slice(-5).reverse().map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium">#{sale.receiptNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(sale.date).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="font-semibold text-green-600">
                      RD$ {sale.total.toLocaleString()}
                    </p>
                  </div>
                ))}
                {sales.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No hay ventas registradas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Alertas de Inventario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        {product.stock} unidades
                      </p>
                      <p className="text-xs text-gray-500">
                        Mín: {product.minStock}
                      </p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No hay alertas de inventario
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

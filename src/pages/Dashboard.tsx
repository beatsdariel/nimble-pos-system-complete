
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePos } from '@/contexts/PosContext';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp,
  AlertTriangle,
  Printer
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

  const printInventoryAlert = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const alertData = {
      date: new Date().toLocaleString(),
      products: lowStockProducts,
      totalProducts: products.length,
      alertCount: lowStockProducts.length
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Alerta de Inventario</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .alert { background-color: #fee; border: 1px solid #fcc; padding: 15px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .critical { background-color: #ffebee; }
            .warning { background-color: #fff3e0; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚨 ALERTA DE INVENTARIO</h1>
            <p>Fecha de generación: ${alertData.date}</p>
          </div>

          <div class="alert">
            <h3>⚠️ RESUMEN DE ALERTAS</h3>
            <p><strong>Total de productos monitoreados:</strong> ${alertData.totalProducts}</p>
            <p><strong>Productos con stock bajo:</strong> ${alertData.alertCount}</p>
            <p><strong>Porcentaje de alerta:</strong> ${((alertData.alertCount / alertData.totalProducts) * 100).toFixed(1)}%</p>
          </div>

          ${alertData.products.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Categoría</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Estado</th>
                  <th>Acción Requerida</th>
                </tr>
              </thead>
              <tbody>
                ${alertData.products.map(product => {
                  const isCritical = product.stock === 0;
                  const isVeryLow = product.stock > 0 && product.stock < product.minStock / 2;
                  const className = isCritical ? 'critical' : isVeryLow ? 'warning' : '';
                  const status = isCritical ? '🔴 AGOTADO' : isVeryLow ? '🟡 MUY BAJO' : '🟠 BAJO';
                  const action = isCritical ? 'REABASTECER INMEDIATAMENTE' : 'Programar reabastecimiento';
                  
                  return `
                    <tr class="${className}">
                      <td><strong>${product.name}</strong><br><small>${product.description}</small></td>
                      <td>${product.sku}</td>
                      <td>${product.category}</td>
                      <td style="text-align: center; font-weight: bold;">${product.stock}</td>
                      <td style="text-align: center;">${product.minStock}</td>
                      <td style="text-align: center;">${status}</td>
                      <td>${action}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          ` : `
            <div style="text-align: center; padding: 40px; color: #666;">
              <h3>✅ ¡Excelente!</h3>
              <p>No hay productos con stock bajo en este momento.</p>
            </div>
          `}

          <div class="footer">
            <p><em>Este reporte fue generado automáticamente por el Sistema POS</em></p>
            <p><strong>Recomendación:</strong> Revisar y actualizar este reporte diariamente</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Alertas de Inventario
              </CardTitle>
              {lowStockProducts.length > 0 && (
                <Button
                  onClick={printInventoryAlert}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
              )}
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
                      <p className={`font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        {product.stock} unidades
                      </p>
                      <p className="text-xs text-gray-500">
                        Mín: {product.minStock}
                      </p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-green-600 font-medium">✅ Inventario en buen estado</p>
                    <p className="text-gray-500 text-sm">No hay alertas de inventario</p>
                  </div>
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

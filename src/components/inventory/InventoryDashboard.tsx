
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { Package, DollarSign, TrendingUp, AlertTriangle, ShoppingCart, Users } from 'lucide-react';

const InventoryDashboard = () => {
  const { products, purchases, suppliers } = usePos();

  // Calculate inventory stats
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.stock * product.cost), 0);
  const lowStockItems = products.filter(product => product.stock <= product.minStock && product.stock > 0).length;
  const outOfStockItems = products.filter(product => product.stock === 0).length;
  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const averageMargin = products.reduce((sum, product) => {
    const margin = ((product.price - product.cost) / product.cost) * 100;
    return sum + margin;
  }, 0) / totalProducts;

  // Top products by value
  const topProductsByValue = [...products]
    .map(product => ({
      ...product,
      totalValue: product.stock * product.cost,
      margin: ((product.price - product.cost) / product.cost) * 100
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  // Recent purchases
  const recentPurchases = [...purchases]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Productos</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Valor Inventario</p>
                <p className="text-2xl font-bold">RD$ {totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Margen Promedio</p>
                <p className="text-2xl font-bold">{averageMargin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Sin Stock</p>
                <p className="text-2xl font-bold">{outOfStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-sm text-gray-600">Proveedores</p>
                <p className="text-2xl font-bold">{suppliers.filter(s => s.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Value */}
        <Card>
          <CardHeader>
            <CardTitle>Productos con Mayor Valor en Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProductsByValue.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">Stock: {product.stock} | Margen: {product.margin.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">RD$ {product.totalValue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">RD$ {product.cost.toFixed(2)} c/u</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle>Compras Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{purchase.supplierName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(purchase.date).toLocaleDateString()} | {purchase.purchaseNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">RD$ {purchase.total.toLocaleString()}</p>
                    <Badge variant={
                      purchase.status === 'received' ? 'default' :
                      purchase.status === 'pending' ? 'secondary' :
                      purchase.status === 'partial' ? 'outline' : 'destructive'
                    }>
                      {purchase.status === 'received' ? 'Recibida' :
                       purchase.status === 'pending' ? 'Pendiente' :
                       purchase.status === 'partial' ? 'Parcial' : 'Cancelada'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Productos con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {products.filter(product => product.stock <= product.minStock && product.stock > 0).map((product) => (
                <div key={product.id} className="bg-white p-3 rounded-lg">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">Stock: {product.stock} | Mínimo: {product.minStock}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryDashboard;

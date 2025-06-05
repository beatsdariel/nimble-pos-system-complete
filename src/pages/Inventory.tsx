
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductModal from '@/components/inventory/ProductModal';
import SupplierModal from '@/components/inventory/SupplierModal';
import PurchaseModal from '@/components/inventory/PurchaseModal';
import InventoryCountModal from '@/components/inventory/InventoryCountModal';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import { usePos } from '@/contexts/PosContext';
import { 
  Package, Plus, Search, Edit, Trash2, Users, ShoppingCart, 
  Calculator, BarChart3, ClipboardList, TrendingUp 
} from 'lucide-react';
import { Supplier, Purchase, InventoryCount } from '@/types/inventory';

const Inventory = () => {
  const { 
    products, deleteProduct, suppliers, purchases, inventoryCounts 
  } = usePos();
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [editingCount, setEditingCount] = useState<InventoryCount | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPurchases = purchases.filter(purchase =>
    purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowSupplierModal(true);
  };

  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setShowSupplierModal(true);
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setShowPurchaseModal(true);
  };

  const handleNewPurchase = () => {
    setEditingPurchase(null);
    setShowPurchaseModal(true);
  };

  const handleNewCount = () => {
    setEditingCount(null);
    setShowCountModal(true);
  };

  const handleViewCount = (count: InventoryCount) => {
    setEditingCount(count);
    setShowCountModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
            <p className="text-gray-600">Gestión completa de inventario, compras y proveedores</p>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Proveedores
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Compras
            </TabsTrigger>
            <TabsTrigger value="counts" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Conteos
            </TabsTrigger>
            <TabsTrigger value="margins" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Márgenes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <InventoryDashboard />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Lista de Productos
                  </CardTitle>
                  <Button onClick={handleNewProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Producto
                  </Button>
                </div>
                <div className="flex gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Producto</th>
                        <th className="text-left p-2">SKU</th>
                        <th className="text-left p-2">Categoría</th>
                        <th className="text-right p-2">Costo</th>
                        <th className="text-right p-2">Precio</th>
                        <th className="text-right p-2">Margen</th>
                        <th className="text-right p-2">Stock</th>
                        <th className="text-center p-2">Estado</th>
                        <th className="text-center p-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const margin = ((product.price - product.cost) / product.cost) * 100;
                        return (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.description}</p>
                              </div>
                            </td>
                            <td className="p-2 font-mono text-sm">{product.sku}</td>
                            <td className="p-2">{product.category}</td>
                            <td className="p-2 text-right">RD$ {product.cost.toFixed(2)}</td>
                            <td className="p-2 text-right font-medium">
                              RD$ {product.price.toLocaleString()}
                            </td>
                            <td className="p-2 text-right">
                              <Badge variant={margin >= 30 ? 'default' : margin >= 15 ? 'secondary' : 'destructive'}>
                                {margin.toFixed(1)}%
                              </Badge>
                            </td>
                            <td className="p-2 text-right">{product.stock}</td>
                            <td className="p-2 text-center">
                              <Badge variant={
                                product.stock === 0 ? "destructive" :
                                product.stock <= product.minStock ? "secondary" : "default"
                              }>
                                {product.stock === 0 ? "Sin Stock" :
                                 product.stock <= product.minStock ? "Stock Bajo" : "Disponible"}
                              </Badge>
                            </td>
                            <td className="p-2 text-center">
                              <div className="flex justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteProduct(product.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Lista de Proveedores
                  </CardTitle>
                  <Button onClick={handleNewSupplier}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Proveedor
                  </Button>
                </div>
                <div className="flex gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar proveedores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Empresa</th>
                        <th className="text-left p-2">Contacto</th>
                        <th className="text-left p-2">Teléfono</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-right p-2">Límite Crédito</th>
                        <th className="text-center p-2">Estado</th>
                        <th className="text-center p-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuppliers.map((supplier) => (
                        <tr key={supplier.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{supplier.name}</p>
                              <p className="text-sm text-gray-500">{supplier.taxId}</p>
                            </div>
                          </td>
                          <td className="p-2">{supplier.contactName}</td>
                          <td className="p-2">{supplier.phone}</td>
                          <td className="p-2">{supplier.email}</td>
                          <td className="p-2 text-right">
                            {supplier.creditLimit ? `RD$ ${supplier.creditLimit.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-2 text-center">
                            <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                              {supplier.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td className="p-2 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSupplier(supplier)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Registro de Compras
                  </CardTitle>
                  <Button onClick={handleNewPurchase}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Compra
                  </Button>
                </div>
                <div className="flex gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar compras..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Número</th>
                        <th className="text-left p-2">Proveedor</th>
                        <th className="text-left p-2">Fecha</th>
                        <th className="text-right p-2">Total</th>
                        <th className="text-center p-2">Estado</th>
                        <th className="text-center p-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPurchases.map((purchase) => (
                        <tr key={purchase.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-mono">{purchase.purchaseNumber}</td>
                          <td className="p-2">{purchase.supplierName}</td>
                          <td className="p-2">{new Date(purchase.date).toLocaleDateString()}</td>
                          <td className="p-2 text-right font-medium">
                            RD$ {purchase.total.toLocaleString()}
                          </td>
                          <td className="p-2 text-center">
                            <Badge variant={
                              purchase.status === 'received' ? 'default' :
                              purchase.status === 'pending' ? 'secondary' :
                              purchase.status === 'partial' ? 'outline' : 'destructive'
                            }>
                              {purchase.status === 'received' ? 'Recibida' :
                               purchase.status === 'pending' ? 'Pendiente' :
                               purchase.status === 'partial' ? 'Parcial' : 'Cancelada'}
                            </Badge>
                          </td>
                          <td className="p-2 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPurchase(purchase)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="counts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Conteos de Inventario
                  </CardTitle>
                  <Button onClick={handleNewCount}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Conteo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Fecha</th>
                        <th className="text-right p-2">Productos</th>
                        <th className="text-right p-2">Diferencias</th>
                        <th className="text-center p-2">Estado</th>
                        <th className="text-center p-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryCounts.map((count) => {
                        const itemsWithDifferences = count.items.filter(item => item.difference !== 0).length;
                        return (
                          <tr key={count.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{new Date(count.date).toLocaleDateString()}</td>
                            <td className="p-2 text-right">{count.items.length}</td>
                            <td className="p-2 text-right">{itemsWithDifferences}</td>
                            <td className="p-2 text-center">
                              <Badge variant={count.status === 'completed' ? 'default' : 'secondary'}>
                                {count.status === 'completed' ? 'Completado' : 'En Progreso'}
                              </Badge>
                            </td>
                            <td className="p-2 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewCount(count)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="margins" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productos con Mayor Margen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...products]
                      .map(product => ({
                        ...product,
                        margin: ((product.price - product.cost) / product.cost) * 100
                      }))
                      .sort((a, b) => b.margin - a.margin)
                      .slice(0, 10)
                      .map((product) => (
                        <div key={product.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              Costo: RD$ {product.cost.toFixed(2)} | Precio: RD$ {product.price.toFixed(2)}
                            </p>
                          </div>
                          <Badge variant="default">
                            {product.margin.toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Productos con Menor Margen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...products]
                      .map(product => ({
                        ...product,
                        margin: ((product.price - product.cost) / product.cost) * 100
                      }))
                      .sort((a, b) => a.margin - b.margin)
                      .slice(0, 10)
                      .map((product) => (
                        <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              Costo: RD$ {product.cost.toFixed(2)} | Precio: RD$ {product.price.toFixed(2)}
                            </p>
                          </div>
                          <Badge variant="destructive">
                            {product.margin.toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ProductModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={editingProduct}
      />

      <SupplierModal
        open={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        supplier={editingSupplier}
      />

      <PurchaseModal
        open={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        purchase={editingPurchase}
      />

      <InventoryCountModal
        open={showCountModal}
        onClose={() => setShowCountModal(false)}
        inventoryCount={editingCount}
      />
    </Layout>
  );
};

export default Inventory;


import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProductModal from '@/components/inventory/ProductModal';
import { usePos } from '@/contexts/PosContext';
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react';

const Inventory = () => {
  const { products, deleteProduct } = usePos();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
            <p className="text-gray-600">Gestión de productos y stock</p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lista de Productos
            </CardTitle>
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
                    <th className="text-right p-2">Precio</th>
                    <th className="text-right p-2">Stock</th>
                    <th className="text-center p-2">Estado</th>
                    <th className="text-center p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.description}</p>
                        </div>
                      </td>
                      <td className="p-2 font-mono text-sm">{product.sku}</td>
                      <td className="p-2">{product.category}</td>
                      <td className="p-2 text-right font-medium">
                        RD$ {product.price.toLocaleString()}
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
                            onClick={() => handleEdit(product)}
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProductModal
        open={showModal}
        onClose={() => setShowModal(false)}
        product={editingProduct}
      />
    </Layout>
  );
};

export default Inventory;

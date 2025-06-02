
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings as SettingsIcon, Store, Users, Receipt, Database } from 'lucide-react';

const Settings = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600">Configuración general del sistema POS</p>
        </div>

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList>
            <TabsTrigger value="business">Negocio</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="receipts">Recibos</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Información del Negocio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business-name">Nombre del Negocio</Label>
                    <Input id="business-name" defaultValue="Mi Negocio POS" />
                  </div>
                  <div>
                    <Label htmlFor="business-rnc">RNC</Label>
                    <Input id="business-rnc" placeholder="123456789" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="business-address">Dirección</Label>
                  <Textarea 
                    id="business-address" 
                    placeholder="Dirección completa del negocio"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business-phone">Teléfono</Label>
                    <Input id="business-phone" placeholder="809-555-1234" />
                  </div>
                  <div>
                    <Label htmlFor="business-email">Correo Electrónico</Label>
                    <Input id="business-email" type="email" placeholder="info@negocio.com" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Moneda</Label>
                    <Input id="currency" defaultValue="RD$" />
                  </div>
                  <div>
                    <Label htmlFor="tax-rate">Tasa de ITBIS (%)</Label>
                    <Input id="tax-rate" type="number" defaultValue="18" />
                  </div>
                </div>
                
                <Button>Guardar Configuración</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Usuarios del Sistema</h3>
                    <Button>Agregar Usuario</Button>
                  </div>
                  
                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-gray-50">
                      <div className="grid grid-cols-4 gap-4 font-medium">
                        <span>Nombre</span>
                        <span>Email</span>
                        <span>Rol</span>
                        <span>Acciones</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-4 gap-4 items-center">
                        <span>Admin User</span>
                        <span>admin@pos.com</span>
                        <span>Administrador</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Editar</Button>
                          <Button size="sm" variant="outline">Eliminar</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receipts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Configuración de Recibos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="receipt-header">Encabezado del Recibo</Label>
                  <Textarea 
                    id="receipt-header" 
                    placeholder="Texto que aparecerá en la parte superior del recibo"
                    rows={3}
                    defaultValue="¡Gracias por su compra!"
                  />
                </div>
                
                <div>
                  <Label htmlFor="receipt-footer">Pie de Página del Recibo</Label>
                  <Textarea 
                    id="receipt-footer" 
                    placeholder="Texto que aparecerá en la parte inferior del recibo"
                    rows={3}
                    defaultValue="Esperamos verle pronto nuevamente"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receipt-copies">Número de Copias</Label>
                    <Input id="receipt-copies" type="number" defaultValue="1" />
                  </div>
                  <div>
                    <Label htmlFor="receipt-width">Ancho del Recibo (mm)</Label>
                    <Input id="receipt-width" type="number" defaultValue="80" />
                  </div>
                </div>
                
                <Button>Guardar Configuración</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Configuración del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Respaldo de Datos</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Realiza un respaldo completo de todos los datos del sistema
                    </p>
                    <Button>Crear Respaldo</Button>
                  </div>
                  
                  <hr />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Restaurar Datos</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Restaura los datos desde un archivo de respaldo
                    </p>
                    <Button variant="outline">Restaurar desde Archivo</Button>
                  </div>
                  
                  <hr />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Limpiar Datos</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Elimina todos los datos de ventas y transacciones (mantiene productos y clientes)
                    </p>
                    <Button variant="destructive">Limpiar Datos de Ventas</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;

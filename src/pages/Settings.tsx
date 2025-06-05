
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/contexts/SettingsContext';
import UserManagement from '@/components/settings/UserManagement';
import AccountsModule from '@/components/settings/AccountsModule';
import { Settings as SettingsIcon, Store, Users, Receipt, Database, CreditCard, DollarSign, Upload } from 'lucide-react';

const Settings = () => {
  const { 
    businessSettings, 
    updateBusinessSettings,
    receiptSettings,
    updateReceiptSettings,
    systemSettings,
    updateSystemSettings,
    createBackup,
    restoreBackup,
    clearSalesData
  } = useSettings();

  const [businessForm, setBusinessForm] = useState(businessSettings || {
    name: '',
    rnc: '',
    address: '',
    phone: '',
    email: '',
    currency: 'RD$',
    taxRate: 18
  });

  const [receiptForm, setReceiptForm] = useState(receiptSettings || {
    header: '',
    footer: '',
    copies: 1,
    width: 80,
    showLogo: true,
    showTax: true,
    showBarcode: false
  });

  const [systemForm, setSystemForm] = useState(systemSettings || {
    backupFrequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    autoBackup: true,
    dataRetention: 365,
    maintenanceMode: false
  });

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessSettings(businessForm);
  };

  const handleReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateReceiptSettings(receiptForm);
  };

  const handleSystemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings(systemForm);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      restoreBackup(file);
    }
  };

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
            <TabsTrigger value="accounts">Cuentas</TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Información del Negocio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBusinessSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-name">Nombre del Negocio</Label>
                      <Input 
                        id="business-name" 
                        value={businessForm.name}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="business-rnc">RNC</Label>
                      <Input 
                        id="business-rnc" 
                        value={businessForm.rnc}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, rnc: e.target.value }))}
                        placeholder="123456789" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="business-address">Dirección</Label>
                    <Textarea 
                      id="business-address" 
                      value={businessForm.address}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Dirección completa del negocio"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-phone">Teléfono</Label>
                      <Input 
                        id="business-phone" 
                        value={businessForm.phone}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="809-555-1234" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="business-email">Correo Electrónico</Label>
                      <Input 
                        id="business-email" 
                        type="email" 
                        value={businessForm.email}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="info@negocio.com" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currency">Moneda</Label>
                      <Input 
                        id="currency" 
                        value={businessForm.currency}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, currency: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax-rate">Tasa de ITBIS (%)</Label>
                      <Input 
                        id="tax-rate" 
                        type="number" 
                        value={businessForm.taxRate}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit">Guardar Configuración</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="receipts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Configuración de Recibos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReceiptSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="receipt-header">Encabezado del Recibo</Label>
                    <Textarea 
                      id="receipt-header" 
                      value={receiptForm.header}
                      onChange={(e) => setReceiptForm(prev => ({ ...prev, header: e.target.value }))}
                      placeholder="Texto que aparecerá en la parte superior del recibo"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="receipt-footer">Pie de Página del Recibo</Label>
                    <Textarea 
                      id="receipt-footer" 
                      value={receiptForm.footer}
                      onChange={(e) => setReceiptForm(prev => ({ ...prev, footer: e.target.value }))}
                      placeholder="Texto que aparecerá en la parte inferior del recibo"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="receipt-copies">Número de Copias</Label>
                      <Input 
                        id="receipt-copies" 
                        type="number" 
                        value={receiptForm.copies}
                        onChange={(e) => setReceiptForm(prev => ({ ...prev, copies: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="receipt-width">Ancho del Recibo (mm)</Label>
                      <Input 
                        id="receipt-width" 
                        type="number" 
                        value={receiptForm.width}
                        onChange={(e) => setReceiptForm(prev => ({ ...prev, width: parseInt(e.target.value) || 80 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-logo">Mostrar Logo</Label>
                      <Switch
                        id="show-logo"
                        checked={receiptForm.showLogo}
                        onCheckedChange={(checked) => setReceiptForm(prev => ({ ...prev, showLogo: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-tax">Mostrar Impuestos</Label>
                      <Switch
                        id="show-tax"
                        checked={receiptForm.showTax}
                        onCheckedChange={(checked) => setReceiptForm(prev => ({ ...prev, showTax: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-barcode">Mostrar Código de Barras</Label>
                      <Switch
                        id="show-barcode"
                        checked={receiptForm.showBarcode}
                        onCheckedChange={(checked) => setReceiptForm(prev => ({ ...prev, showBarcode: checked }))}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit">Guardar Configuración</Button>
                </form>
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
              <CardContent>
                <form onSubmit={handleSystemSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="backup-frequency">Frecuencia de Respaldo</Label>
                      <Select 
                        value={systemForm.backupFrequency} 
                        onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setSystemForm(prev => ({ ...prev, backupFrequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diario</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="data-retention">Retención de Datos (días)</Label>
                      <Input
                        id="data-retention"
                        type="number"
                        value={systemForm.dataRetention}
                        onChange={(e) => setSystemForm(prev => ({ ...prev, dataRetention: parseInt(e.target.value) || 365 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-backup">Respaldo Automático</Label>
                      <Switch
                        id="auto-backup"
                        checked={systemForm.autoBackup}
                        onCheckedChange={(checked) => setSystemForm(prev => ({ ...prev, autoBackup: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="maintenance-mode">Modo Mantenimiento</Label>
                      <Switch
                        id="maintenance-mode"
                        checked={systemForm.maintenanceMode}
                        onCheckedChange={(checked) => setSystemForm(prev => ({ ...prev, maintenanceMode: checked }))}
                      />
                    </div>
                  </div>

                  <Button type="submit">Guardar Configuración</Button>
                </form>

                <hr className="my-6" />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Respaldo de Datos</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Realiza un respaldo completo de todos los datos del sistema
                    </p>
                    <Button onClick={createBackup}>Crear Respaldo</Button>
                  </div>
                  
                  <hr />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Restaurar Datos</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Restaura los datos desde un archivo de respaldo
                    </p>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" onClick={() => document.getElementById('backup-file')?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Restaurar desde Archivo
                      </Button>
                      <input
                        id="backup-file"
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleFileRestore}
                      />
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Limpiar Datos</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Elimina todos los datos de ventas y transacciones (mantiene productos y clientes)
                    </p>
                    <Button variant="destructive" onClick={clearSalesData}>
                      Limpiar Datos de Ventas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <AccountsModule />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;

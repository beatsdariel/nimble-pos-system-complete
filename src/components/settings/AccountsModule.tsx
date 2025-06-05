
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/contexts/SettingsContext';
import { usePos } from '@/contexts/PosContext';
import { AccountsReceivable, AccountsPayable } from '@/types/settings';
import { CreditCard, DollarSign, Plus, Edit, Calendar } from 'lucide-react';

const AccountsModule = () => {
  const { 
    accountsReceivable, 
    accountsPayable, 
    addAccountReceivable, 
    addAccountPayable,
    updateAccountReceivable,
    updateAccountPayable
  } = useSettings();
  const { customers, suppliers } = usePos();
  
  const [showReceivableModal, setShowReceivableModal] = useState(false);
  const [showPayableModal, setShowPayableModal] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<AccountsReceivable | null>(null);
  const [editingPayable, setEditingPayable] = useState<AccountsPayable | null>(null);
  
  const [receivableForm, setReceivableForm] = useState({
    customerId: '',
    customerName: '',
    invoiceNumber: '',
    amount: 0,
    dueDate: '',
    description: '',
    status: 'pending' as 'pending' | 'overdue' | 'paid' | 'partial'
  });

  const [payableForm, setPayableForm] = useState({
    supplierId: '',
    supplierName: '',
    invoiceNumber: '',
    amount: 0,
    dueDate: '',
    description: '',
    status: 'pending' as 'pending' | 'overdue' | 'paid' | 'partial'
  });

  const handleReceivableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customer = customers.find(c => c.id === receivableForm.customerId);
    if (!customer) return;

    const accountData = {
      ...receivableForm,
      customerName: customer.name,
      paidAmount: 0,
      remainingAmount: receivableForm.amount
    };

    if (editingReceivable) {
      updateAccountReceivable(editingReceivable.id, accountData);
    } else {
      addAccountReceivable(accountData);
    }
    
    setShowReceivableModal(false);
    setEditingReceivable(null);
    setReceivableForm({
      customerId: '',
      customerName: '',
      invoiceNumber: '',
      amount: 0,
      dueDate: '',
      description: '',
      status: 'pending'
    });
  };

  const handlePayableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplier = suppliers.find(s => s.id === payableForm.supplierId);
    if (!supplier) return;

    const accountData = {
      ...payableForm,
      supplierName: supplier.name,
      paidAmount: 0,
      remainingAmount: payableForm.amount
    };

    if (editingPayable) {
      updateAccountPayable(editingPayable.id, accountData);
    } else {
      addAccountPayable(accountData);
    }
    
    setShowPayableModal(false);
    setEditingPayable(null);
    setPayableForm({
      supplierId: '',
      supplierName: '',
      invoiceNumber: '',
      amount: 0,
      dueDate: '',
      description: '',
      status: 'pending'
    });
  };

  const totalReceivable = accountsReceivable.reduce((sum, acc) => sum + acc.remainingAmount, 0);
  const totalPayable = accountsPayable.reduce((sum, acc) => sum + acc.remainingAmount, 0);
  const overdueReceivable = accountsReceivable.filter(acc => 
    new Date(acc.dueDate) < new Date() && acc.status !== 'paid'
  ).length;
  const overduePayable = accountsPayable.filter(acc => 
    new Date(acc.dueDate) < new Date() && acc.status !== 'paid'
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total por Cobrar</p>
                <p className="text-xl font-bold">RD$ {totalReceivable.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total por Pagar</p>
                <p className="text-xl font-bold">RD$ {totalPayable.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vencidas (Cobrar)</p>
                <p className="text-xl font-bold">{overdueReceivable}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vencidas (Pagar)</p>
                <p className="text-xl font-bold">{overduePayable}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="receivable" className="w-full">
        <TabsList>
          <TabsTrigger value="receivable">Cuentas por Cobrar</TabsTrigger>
          <TabsTrigger value="payable">Cuentas por Pagar</TabsTrigger>
        </TabsList>

        <TabsContent value="receivable" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Cuentas por Cobrar</CardTitle>
                <Button onClick={() => setShowReceivableModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Cuenta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Cliente</th>
                      <th className="text-left p-2">Factura</th>
                      <th className="text-right p-2">Monto</th>
                      <th className="text-right p-2">Pendiente</th>
                      <th className="text-left p-2">Vencimiento</th>
                      <th className="text-center p-2">Estado</th>
                      <th className="text-center p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountsReceivable.map((account) => (
                      <tr key={account.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{account.customerName}</td>
                        <td className="p-2 font-mono">{account.invoiceNumber}</td>
                        <td className="p-2 text-right">RD$ {account.amount.toLocaleString()}</td>
                        <td className="p-2 text-right font-medium">RD$ {account.remainingAmount.toLocaleString()}</td>
                        <td className="p-2">{new Date(account.dueDate).toLocaleDateString()}</td>
                        <td className="p-2 text-center">
                          <Badge variant={
                            account.status === 'paid' ? 'default' :
                            account.status === 'overdue' ? 'destructive' :
                            account.status === 'partial' ? 'secondary' : 'outline'
                          }>
                            {account.status === 'paid' ? 'Pagada' :
                             account.status === 'overdue' ? 'Vencida' :
                             account.status === 'partial' ? 'Parcial' : 'Pendiente'}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Button size="sm" variant="outline">
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

        <TabsContent value="payable" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Cuentas por Pagar</CardTitle>
                <Button onClick={() => setShowPayableModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Cuenta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Proveedor</th>
                      <th className="text-left p-2">Factura</th>
                      <th className="text-right p-2">Monto</th>
                      <th className="text-right p-2">Pendiente</th>
                      <th className="text-left p-2">Vencimiento</th>
                      <th className="text-center p-2">Estado</th>
                      <th className="text-center p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountsPayable.map((account) => (
                      <tr key={account.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{account.supplierName}</td>
                        <td className="p-2 font-mono">{account.invoiceNumber}</td>
                        <td className="p-2 text-right">RD$ {account.amount.toLocaleString()}</td>
                        <td className="p-2 text-right font-medium">RD$ {account.remainingAmount.toLocaleString()}</td>
                        <td className="p-2">{new Date(account.dueDate).toLocaleDateString()}</td>
                        <td className="p-2 text-center">
                          <Badge variant={
                            account.status === 'paid' ? 'default' :
                            account.status === 'overdue' ? 'destructive' :
                            account.status === 'partial' ? 'secondary' : 'outline'
                          }>
                            {account.status === 'paid' ? 'Pagada' :
                             account.status === 'overdue' ? 'Vencida' :
                             account.status === 'partial' ? 'Parcial' : 'Pendiente'}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Button size="sm" variant="outline">
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
      </Tabs>

      {/* Receivable Modal */}
      <Dialog open={showReceivableModal} onOpenChange={setShowReceivableModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Cuenta por Cobrar</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleReceivableSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customer">Cliente</Label>
              <Select value={receivableForm.customerId} onValueChange={(value) => setReceivableForm(prev => ({ ...prev, customerId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Número de Factura</Label>
                <Input
                  id="invoiceNumber"
                  value={receivableForm.invoiceNumber}
                  onChange={(e) => setReceivableForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={receivableForm.amount}
                  onChange={(e) => setReceivableForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
              <Input
                id="dueDate"
                type="date"
                value={receivableForm.dueDate}
                onChange={(e) => setReceivableForm(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={receivableForm.description}
                onChange={(e) => setReceivableForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowReceivableModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Agregar Cuenta</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payable Modal */}
      <Dialog open={showPayableModal} onOpenChange={setShowPayableModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Cuenta por Pagar</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handlePayableSubmit} className="space-y-4">
            <div>
              <Label htmlFor="supplier">Proveedor</Label>
              <Select value={payableForm.supplierId} onValueChange={(value) => setPayableForm(prev => ({ ...prev, supplierId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter(s => s.isActive).map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Número de Factura</Label>
                <Input
                  id="invoiceNumber"
                  value={payableForm.invoiceNumber}
                  onChange={(e) => setPayableForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={payableForm.amount}
                  onChange={(e) => setPayableForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
              <Input
                id="dueDate"
                type="date"
                value={payableForm.dueDate}
                onChange={(e) => setPayableForm(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={payableForm.description}
                onChange={(e) => setPayableForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowPayableModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Agregar Cuenta</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountsModule;

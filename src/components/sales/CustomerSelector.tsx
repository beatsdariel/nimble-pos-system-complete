
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { Search, User, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerSelectorProps {
  open: boolean;
  onClose: () => void;
  selectedCustomer: string;
  onCustomerSelect: (customerId: string) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  open,
  onClose,
  selectedCustomer,
  onCustomerSelect
}) => {
  const { customers, addCustomer } = usePos();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    address: '',
    isWholesale: false
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.document?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const handleSelectCustomer = (customerId: string) => {
    onCustomerSelect(customerId);
    toast.success('Cliente asignado correctamente');
    onClose();
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim()) {
      toast.error('El nombre del cliente es requerido');
      return;
    }

    addCustomer(newCustomer);
    toast.success('Cliente agregado correctamente');
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      document: '',
      address: '',
      isWholesale: false
    });
    setShowAddForm(false);
  };

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Asignar Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Customer */}
          {selectedCustomerData && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-blue-900">Cliente Actual</h3>
                    <p className="text-blue-800">{selectedCustomerData.name}</p>
                    <p className="text-sm text-blue-600">
                      {selectedCustomerData.document && `Documento: ${selectedCustomerData.document}`}
                    </p>
                    {selectedCustomerData.isWholesale && (
                      <Badge className="mt-1">Cliente Mayorista</Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectCustomer('no-customer')}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Add */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, documento o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-1" />
              Nuevo Cliente
            </Button>
          </div>

          {/* Add Customer Form */}
          {showAddForm && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-green-900">Agregar Nuevo Cliente</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Nombre completo *"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  />
                  <Input
                    placeholder="Documento (RNC/Cédula)"
                    value={newCustomer.document}
                    onChange={(e) => setNewCustomer({...newCustomer, document: e.target.value})}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  />
                  <Input
                    placeholder="Teléfono"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  />
                </div>
                <Input
                  placeholder="Dirección"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isWholesale"
                    checked={newCustomer.isWholesale}
                    onChange={(e) => setNewCustomer({...newCustomer, isWholesale: e.target.checked})}
                  />
                  <label htmlFor="isWholesale" className="text-sm">Cliente Mayorista</label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddCustomer}>Agregar Cliente</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSelectCustomer('no-customer')}
            >
              CONSUMIDOR FINAL
            </Button>
            
            {filteredCustomers.map((customer) => (
              <Card 
                key={customer.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  customer.id === selectedCustomer ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleSelectCustomer(customer.id)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{customer.name}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {customer.document && <p>Documento: {customer.document}</p>}
                        {customer.phone && <p>Teléfono: {customer.phone}</p>}
                        {customer.email && <p>Email: {customer.email}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {customer.isWholesale && (
                        <Badge variant="secondary">Mayorista</Badge>
                      )}
                      {customer.creditLimit && customer.creditLimit > 0 && (
                        <Badge variant="outline">
                          Crédito: RD$ {customer.creditLimit.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCustomers.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron clientes</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerSelector;

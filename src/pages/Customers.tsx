
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomerModal from '@/components/customers/CustomerModal';
import CustomerAccountStatement from '@/components/customers/CustomerAccountStatement';
import { usePos } from '@/contexts/PosContext';
import { Users, Plus, Search, Edit, Phone, Mail, CreditCard, Wallet } from 'lucide-react';
import { Customer } from '@/types/pos';

const Customers = () => {
  const { customers } = usePos();
  const [showModal, setShowModal] = useState(false);
  const [showAccountStatement, setShowAccountStatement] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.document?.includes(searchTerm)
  );

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleViewAccountStatement = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowAccountStatement(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">Gestión de base de datos de clientes</p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Clientes
            </CardTitle>
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(customer)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {customer.document && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Documento:</strong> {customer.document}
                      </p>
                    )}
                    
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                    )}
                    
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    )}
                    
                    {customer.address && (
                      <p className="text-sm text-gray-500 mt-2">
                        {customer.address}
                      </p>
                    )}
                    
                    {(customer.creditLimit !== undefined) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-sm">
                            <CreditCard className="h-3 w-3" />
                            <span>Crédito:</span>
                          </div>
                          <span className="text-sm font-medium">
                            RD$ {customer.creditLimit.toLocaleString()}
                          </span>
                        </div>
                        
                        {(customer.creditBalance !== undefined && customer.creditBalance > 0) && (
                          <div className="flex justify-between items-center mt-1">
                            <div className="flex items-center gap-1 text-sm">
                              <span>Balance:</span>
                            </div>
                            <span className="text-sm font-medium text-red-600">
                              RD$ {customer.creditBalance.toLocaleString()}
                            </span>
                          </div>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => handleViewAccountStatement(customer)}
                        >
                          <Wallet className="h-3 w-3 mr-1" />
                          Estado de Cuenta
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredCustomers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron clientes</p>
                <p className="text-sm">
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Agrega tu primer cliente'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CustomerModal
        open={showModal}
        onClose={() => setShowModal(false)}
        customer={editingCustomer}
      />
      
      <CustomerAccountStatement
        open={showAccountStatement}
        onClose={() => setShowAccountStatement(false)}
        customer={selectedCustomer}
      />
    </Layout>
  );
};

export default Customers;

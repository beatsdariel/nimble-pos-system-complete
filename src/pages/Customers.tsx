
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomerModal from '@/components/customers/CustomerModal';
import { usePos } from '@/contexts/PosContext';
import { Users, Plus, Search, Edit, Phone, Mail } from 'lucide-react';

const Customers = () => {
  const { customers } = usePos();
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.document?.includes(searchTerm)
  );

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingCustomer(null);
    setShowModal(true);
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
    </Layout>
  );
};

export default Customers;

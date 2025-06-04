
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { usePos } from '@/contexts/PosContext';
import { Customer } from '@/types/pos';
import { toast } from 'sonner';

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ open, onClose, customer }) => {
  const { addCustomer, updateCustomer } = usePos();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    address: '',
    creditLimit: '',
    isWholesale: false
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        document: customer.document || '',
        address: customer.address || '',
        creditLimit: customer.creditLimit ? customer.creditLimit.toString() : '',
        isWholesale: customer.isWholesale || false
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        document: '',
        address: '',
        creditLimit: '',
        isWholesale: false
      });
    }
  }, [customer, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData: Omit<Customer, 'id'> = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      document: formData.document || undefined,
      address: formData.address || undefined,
      creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
      isWholesale: formData.isWholesale
    };

    if (customer) {
      updateCustomer(customer.id, customerData);
      toast.success('Cliente actualizado exitosamente');
    } else {
      addCustomer(customerData);
      toast.success('Cliente creado exitosamente');
    }

    onClose();
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="document">Documento (Cédula/RNC)</Label>
            <Input
              id="document"
              value={formData.document}
              onChange={(e) => handleChange('document', e.target.value)}
              placeholder="001-1234567-8 ó 123456789"
            />
          </div>

          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="cliente@email.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="809-555-1234"
            />
          </div>

          <div>
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Dirección completa del cliente"
              rows={3}
            />
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label htmlFor="creditLimit">Límite de Crédito (RD$)</Label>
              <Input
                id="creditLimit"
                type="number"
                value={formData.creditLimit}
                onChange={(e) => handleChange('creditLimit', e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dejar en blanco o en 0 para no habilitar crédito
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="isWholesale">Cliente Mayorista</Label>
              <Switch
                id="isWholesale"
                checked={formData.isWholesale}
                onCheckedChange={(checked) => handleChange('isWholesale', checked)}
              />
              <div className="w-10"></div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {customer ? 'Actualizar' : 'Crear'} Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerModal;

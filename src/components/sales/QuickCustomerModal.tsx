
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { usePos } from '@/contexts/PosContext';
import { UserPlus, Phone, Mail, CreditCard, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface QuickCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCustomerCreated: (customerId: string) => void;
}

const QuickCustomerModal: React.FC<QuickCustomerModalProps> = ({
  open,
  onClose,
  onCustomerCreated
}) => {
  const { addCustomer } = usePos();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    address: '',
    creditLimit: '',
    isWholesale: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      const newCustomer = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        document: formData.document.trim() || undefined,
        address: formData.address.trim() || undefined,
        creditLimit: parseFloat(formData.creditLimit) || 0,
        creditBalance: 0,
        isWholesale: formData.isWholesale,
        totalPurchases: 0,
        lastPurchase: undefined
      };

      addCustomer(newCustomer);
      
      // Generate ID for the new customer (in real app this would come from the addCustomer function)
      const customerId = Date.now().toString();
      
      toast.success('Cliente creado exitosamente');
      onCustomerCreated(customerId);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        document: '',
        address: '',
        creditLimit: '',
        isWholesale: false
      });
    } catch (error) {
      toast.error('Error al crear el cliente');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Agregar Cliente Rápido
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre - Required */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre Completo *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nombre del cliente"
              required
              className="mt-1"
            />
          </div>

          {/* Documento */}
          <div>
            <Label htmlFor="document" className="text-sm font-medium">
              Documento (Cédula/RNC)
            </Label>
            <Input
              id="document"
              value={formData.document}
              onChange={(e) => handleInputChange('document', e.target.value)}
              placeholder="001-1234567-8"
              className="mt-1"
            />
          </div>

          {/* Teléfono */}
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Teléfono
            </Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="809-555-1234"
                className="pl-10"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Correo Electrónico
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="cliente@email.com"
                className="pl-10"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <Label htmlFor="address" className="text-sm font-medium">
              Dirección
            </Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Dirección completa"
                className="pl-10"
              />
            </div>
          </div>

          {/* Límite de Crédito */}
          <div>
            <Label htmlFor="creditLimit" className="text-sm font-medium">
              Límite de Crédito (RD$)
            </Label>
            <div className="relative mt-1">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="creditLimit"
                type="number"
                value={formData.creditLimit}
                onChange={(e) => handleInputChange('creditLimit', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="pl-10"
              />
            </div>
          </div>

          {/* Cliente Mayorista */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isWholesale"
              checked={formData.isWholesale}
              onCheckedChange={(checked) => handleInputChange('isWholesale', checked as boolean)}
            />
            <Label htmlFor="isWholesale" className="text-sm font-medium">
              Cliente Mayorista
            </Label>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickCustomerModal;

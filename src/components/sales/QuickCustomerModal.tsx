
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePos } from '@/contexts/PosContext';
import { User, UserPlus } from 'lucide-react';
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
    document: '',
    phone: '',
    email: '',
    isWholesale: false,
    creditLimit: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    const customerData = {
      name: formData.name.trim(),
      document: formData.document.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      isWholesale: formData.isWholesale,
      creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined
    };

    addCustomer(customerData);
    
    // Generate a temporary ID (in real app this would come from the database)
    const customerId = Date.now().toString();
    
    toast.success('Cliente creado exitosamente');
    onCustomerCreated(customerId);
    
    // Reset form
    setFormData({
      name: '',
      document: '',
      phone: '',
      email: '',
      isWholesale: false,
      creditLimit: ''
    });
    
    onClose();
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <div>
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nombre del cliente"
              required
            />
          </div>

          <div>
            <Label htmlFor="document">Documento (Cédula/RNC)</Label>
            <Input
              id="document"
              value={formData.document}
              onChange={(e) => handleChange('document', e.target.value)}
              placeholder="001-1234567-8"
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="cliente@email.com"
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
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="isWholesale">Cliente Mayorista</Label>
              <Switch
                id="isWholesale"
                checked={formData.isWholesale}
                onCheckedChange={(checked) => handleChange('isWholesale', checked)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <User className="h-4 w-4 mr-2" />
              Crear Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickCustomerModal;

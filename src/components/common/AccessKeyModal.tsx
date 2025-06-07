
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface AccessKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  action: string;
  title: string;
  validateKey: (key: string) => boolean;
}

const AccessKeyModal: React.FC<AccessKeyModalProps> = ({
  open,
  onClose,
  onSuccess,
  action,
  title,
  validateKey
}) => {
  const [key, setKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    if (validateKey(key)) {
      toast.success('Acceso autorizado');
      setKey('');
      onClose();
      onSuccess();
    } else {
      toast.error('Clave de acceso incorrecta');
    }
    
    setIsValidating(false);
  };

  const handleClose = () => {
    setKey('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            Control de Acceso - {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-key">Ingrese la clave de acceso:</Label>
            <Input
              id="access-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="****"
              className="text-center text-lg"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!key.trim() || isValidating}
              className="flex-1"
            >
              {isValidating ? 'Validando...' : 'Confirmar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccessKeyModal;

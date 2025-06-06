
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, DollarSign, User } from 'lucide-react';
import { Shift, CashSession } from '@/types/pos';
import { toast } from 'sonner';

interface ShiftSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onStartShift: (shiftId: string, openingAmount: number) => void;
  currentUser: any;
}

const ShiftSelectionModal: React.FC<ShiftSelectionModalProps> = ({
  open,
  onClose,
  onStartShift,
  currentUser
}) => {
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [openingAmount, setOpeningAmount] = useState<string>('');

  const shifts: Shift[] = [
    { id: '1', name: 'Turno Mañana', startTime: '08:00', endTime: '16:00', isActive: true },
    { id: '2', name: 'Turno Tarde', startTime: '16:00', endTime: '24:00', isActive: true },
    { id: '3', name: 'Turno Noche', startTime: '00:00', endTime: '08:00', isActive: true }
  ];

  const handleStartShift = () => {
    if (!selectedShift) {
      toast.error('Debe seleccionar un turno');
      return;
    }

    const amount = parseFloat(openingAmount) || 0;
    if (amount < 0) {
      toast.error('El monto de apertura no puede ser negativo');
      return;
    }

    onStartShift(selectedShift, amount);
    toast.success('Turno iniciado exitosamente');
    onClose();
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('es-DO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Iniciar Turno de Trabajo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Usuario */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Información de Sesión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Usuario:</span>
                <span className="font-medium">{currentUser?.name || 'ADMIN'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">{getCurrentDate()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hora:</span>
                <span className="font-medium">{getCurrentTime()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Selección de Turno */}
          <div className="space-y-3">
            <Label htmlFor="shift">Seleccionar Turno</Label>
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un turno" />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id}>
                    <div className="flex items-center gap-2">
                      <span>{shift.name}</span>
                      <span className="text-sm text-gray-500">
                        ({shift.startTime} - {shift.endTime})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Monto de Apertura */}
          <div className="space-y-3">
            <Label htmlFor="opening-amount">Monto de Apertura en Caja</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="opening-amount"
                type="number"
                placeholder="0.00"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                className="pl-10"
                step="0.01"
                min="0"
              />
            </div>
            <p className="text-xs text-gray-500">
              Ingrese el monto inicial en efectivo de la caja registradora
            </p>
          </div>

          {/* Botón de Inicio */}
          <Button 
            onClick={handleStartShift}
            className="w-full h-12 text-lg font-semibold"
            disabled={!selectedShift}
          >
            <Clock className="h-5 w-5 mr-2" />
            Iniciar Turno
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftSelectionModal;

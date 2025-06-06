
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

const CashRegisterReport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Re_imprimir Cuadre de Caja
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Módulo de reimpresión de cuadre de caja - En desarrollo</p>
      </CardContent>
    </Card>
  );
};

export default CashRegisterReport;

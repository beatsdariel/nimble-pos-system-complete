
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

const CashReceiptReport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Lista Recibo de Efectivo / Cuadres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Módulo de recibos de efectivo y cuadres - En desarrollo</p>
      </CardContent>
    </Card>
  );
};

export default CashReceiptReport;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const ClientSalesReport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Resumen De Ventas Por Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Módulo de ventas por cliente - En desarrollo</p>
      </CardContent>
    </Card>
  );
};

export default ClientSalesReport;

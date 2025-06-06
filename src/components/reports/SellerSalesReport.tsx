
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

const SellerSalesReport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Resumen De Ventas Por Vendedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Módulo de ventas por vendedor - En desarrollo</p>
      </CardContent>
    </Card>
  );
};

export default SellerSalesReport;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';

const GeneralDepartmentSalesReport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Venta General Por Departamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Módulo de venta general por departamento - En desarrollo</p>
      </CardContent>
    </Card>
  );
};

export default GeneralDepartmentSalesReport;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';

const DepartmentSalesReport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Ventas Por Departamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Módulo de ventas por departamentos - En desarrollo</p>
      </CardContent>
    </Card>
  );
};

export default DepartmentSalesReport;

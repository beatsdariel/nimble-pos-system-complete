
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from 'lucide-react';

const SalesGraphReport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Gráfico de Ventas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Módulo de gráficos de ventas - En desarrollo</p>
      </CardContent>
    </Card>
  );
};

export default SalesGraphReport;

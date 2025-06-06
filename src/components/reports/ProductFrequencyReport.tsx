
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

const ProductFrequencyReport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Listado de Frecuencia de Venta de Artículos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Módulo de frecuencia de venta de artículos - En desarrollo</p>
      </CardContent>
    </Card>
  );
};

export default ProductFrequencyReport;

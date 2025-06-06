
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

const ProductClientReport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Lista de Artículos x Clientes - Ventas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Módulo de artículos por clientes - En desarrollo</p>
      </CardContent>
    </Card>
  );
};

export default ProductClientReport;

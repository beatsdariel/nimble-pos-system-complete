
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

const ProductSalesReport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Resumen De Ventas Por Artículos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Módulo de ventas por artículos - En desarrollo</p>
      </CardContent>
    </Card>
  );
};

export default ProductSalesReport;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const SalesSummaryReport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análisis De Ventas Resumido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Módulo de análisis de ventas resumido - En desarrollo</p>
      </CardContent>
    </Card>
  );
};

export default SalesSummaryReport;

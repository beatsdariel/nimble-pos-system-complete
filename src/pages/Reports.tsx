
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePos } from '@/contexts/PosContext';
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  Calendar,
  ShoppingCart,
  UserCheck,
  Building,
  CreditCard,
  PieChart,
  LineChart,
  Activity,
  Target,
  Receipt,
  ArrowLeft
} from 'lucide-react';

// Import report components
import SalesInvoiceReport from '@/components/reports/SalesInvoiceReport';
import SalesDetailReport from '@/components/reports/SalesDetailReport';
import DailySalesReport from '@/components/reports/DailySalesReport';
import MonthlySalesReport from '@/components/reports/MonthlySalesReport';
import NCFSalesReport from '@/components/reports/NCFSalesReport';
import PaymentTypeReport from '@/components/reports/PaymentTypeReport';
import DepartmentSalesReport from '@/components/reports/DepartmentSalesReport';
import GeneralDepartmentSalesReport from '@/components/reports/GeneralDepartmentSalesReport';
import SalesSummaryReport from '@/components/reports/SalesSummaryReport';
import ProductSalesReport from '@/components/reports/ProductSalesReport';
import SellerSalesReport from '@/components/reports/SellerSalesReport';
import ClientSalesReport from '@/components/reports/ClientSalesReport';
import CashRegisterReport from '@/components/reports/CashRegisterReport';
import ProductFrequencyReport from '@/components/reports/ProductFrequencyReport';
import CashReceiptReport from '@/components/reports/CashReceiptReport';
import ProductClientReport from '@/components/reports/ProductClientReport';
import ClientProductReport from '@/components/reports/ClientProductReport';
import SalesGraphReport from '@/components/reports/SalesGraphReport';

const Reports = () => {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const reportModules = [
    {
      id: 'sales-invoice',
      title: 'Relación De Ventas / Facturas',
      icon: FileText,
      description: 'Reporte detallado de todas las ventas y facturas',
      component: SalesInvoiceReport
    },
    {
      id: 'sales-detail',
      title: 'Detalle De Ventas',
      icon: ShoppingCart,
      description: 'Detalle completo de las transacciones de venta',
      component: SalesDetailReport
    },
    {
      id: 'daily-sales',
      title: 'Resumen de Ventas x Día',
      icon: Calendar,
      description: 'Resumen de ventas agrupadas por día',
      component: DailySalesReport
    },
    {
      id: 'monthly-sales',
      title: 'Resumen de Ventas x Mes',
      icon: BarChart3,
      description: 'Resumen de ventas agrupadas por mes',
      component: MonthlySalesReport
    },
    {
      id: 'ncf-sales',
      title: 'Relación de Ventas NCF',
      icon: Receipt,
      description: 'Relación de ventas con comprobantes fiscales NCF',
      component: NCFSalesReport
    },
    {
      id: 'payment-type',
      title: 'Relación de Ventas x Tipo de Pago',
      icon: CreditCard,
      description: 'Ventas agrupadas por método de pago',
      component: PaymentTypeReport
    },
    {
      id: 'department-sales',
      title: 'Ventas Por Departamentos',
      icon: Building,
      description: 'Análisis de ventas por departamento',
      component: DepartmentSalesReport
    },
    {
      id: 'general-department',
      title: 'Venta General Por Departamento',
      icon: Building,
      description: 'Vista general de ventas por departamento',
      component: GeneralDepartmentSalesReport
    },
    {
      id: 'sales-summary',
      title: 'Análisis De Ventas Resumido',
      icon: TrendingUp,
      description: 'Análisis resumido del rendimiento de ventas',
      component: SalesSummaryReport
    },
    {
      id: 'product-sales',
      title: 'Resumen De Ventas Por Artículos',
      icon: Package,
      description: 'Ventas agrupadas por productos',
      component: ProductSalesReport
    },
    {
      id: 'seller-sales',
      title: 'Resumen De Ventas Por Vendedor',
      icon: UserCheck,
      description: 'Rendimiento de ventas por vendedor',
      component: SellerSalesReport
    },
    {
      id: 'client-sales',
      title: 'Resumen De Ventas Por Cliente',
      icon: Users,
      description: 'Historial de ventas por cliente',
      component: ClientSalesReport
    },
    {
      id: 'cash-register',
      title: 'Re_imprimir Cuadre de Caja',
      icon: DollarSign,
      description: 'Reimpresión del cuadre de caja',
      component: CashRegisterReport
    },
    {
      id: 'product-frequency',
      title: 'Listado de Frecuencia de Venta de Artículos',
      icon: Activity,
      description: 'Frecuencia de venta de productos',
      component: ProductFrequencyReport
    },
    {
      id: 'cash-receipt',
      title: 'Lista Recibo de Efectivo / Cuadres',
      icon: Receipt,
      description: 'Listado de recibos de efectivo y cuadres',
      component: CashReceiptReport
    },
    {
      id: 'product-client',
      title: 'Lista de Artículos x Clientes - Ventas',
      icon: Target,
      description: 'Productos vendidos por cliente',
      component: ProductClientReport
    },
    {
      id: 'client-product',
      title: 'Lista de Clientes x Artículos - Ventas',
      icon: Target,
      description: 'Clientes que han comprado productos específicos',
      component: ClientProductReport
    },
    {
      id: 'sales-graph',
      title: 'Gráfico de Ventas',
      icon: LineChart,
      description: 'Gráficos interactivos de ventas',
      component: SalesGraphReport
    }
  ];

  const ActiveReportComponent = activeReport ? 
    reportModules.find(module => module.id === activeReport)?.component : null;

  if (activeReport && ActiveReportComponent) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveReport(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retornar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {reportModules.find(module => module.id === activeReport)?.title}
            </h1>
          </div>
          <ActiveReportComponent />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Sistema completo de reportes y análisis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportModules.map((module) => (
            <Card 
              key={module.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
              onClick={() => setActiveReport(module.id)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <module.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Return Button */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-yellow-400 px-8 py-3 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 text-black font-semibold">
              <ArrowLeft className="h-5 w-5" />
              Retornar
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;

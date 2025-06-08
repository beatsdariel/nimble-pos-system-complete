
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePos } from '@/contexts/PosContext';
import { Button } from '@/components/ui/button';
import CashClosureModal from '@/components/cash/CashClosureModal';
import DayClosureModal from '@/components/cash/DayClosureModal';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  Home,
  Receipt,
  LogOut,
  Calculator,
  Calendar
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { currentShift, addCashClosure } = usePos();
  const [showCashClosure, setShowCashClosure] = useState(false);
  const [showDayClosure, setShowDayClosure] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, adminOnly: false },
    { name: 'Ventas', href: '/sales', icon: ShoppingCart, adminOnly: false },
    { name: 'Inventario', href: '/inventory', icon: Package, adminOnly: true },
    { name: 'Clientes', href: '/customers', icon: Users, adminOnly: true },
    { name: 'Reportes', href: '/reports', icon: BarChart3, adminOnly: true },
    { name: 'Configuración', href: '/settings', icon: Settings, adminOnly: true },
  ];

  // Filtrar navegación según el rol del usuario
  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || currentUser?.role === 'admin'
  );

  const handleLogout = () => {
    logout();
  };

  const handleCashClosure = (closureData: any) => {
    addCashClosure(closureData);
    setShowCashClosure(false);
  };

  // Get opening amount from current shift or default to 0
  const openingAmount = currentShift?.openingAmount || 0;

  return (
    <>
      <div className="bg-sidebar text-sidebar-foreground w-64 min-h-screen p-4 flex flex-col border-r border-sidebar-border">
        <div className="flex items-center gap-2 mb-8">
          <Receipt className="h-8 w-8 text-sidebar-primary" />
          <h1 className="text-xl font-bold text-sidebar-foreground">POS System</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Controles de Caja */}
        <div className="border-t border-sidebar-border pt-4 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setShowCashClosure(true)}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Cuadre de Cajas
          </Button>
          
          {currentUser?.role === 'admin' && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setShowDayClosure(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Finalizar Día
            </Button>
          )}
        </div>

        {/* Información del Usuario */}
        <div className="border-t border-sidebar-border pt-4">
          <div className="text-sm text-sidebar-foreground mb-3">
            <p>Usuario: {currentUser?.name}</p>
            <p>Rol: {currentUser?.role === 'admin' ? 'Administrador' : 'Empleado'}</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <CashClosureModal 
        open={showCashClosure} 
        onClose={() => setShowCashClosure(false)}
        onCloseCash={handleCashClosure}
        openingAmount={openingAmount}
      />
      
      <DayClosureModal 
        open={showDayClosure} 
        onClose={() => setShowDayClosure(false)} 
      />
    </>
  );
};

export default Sidebar;

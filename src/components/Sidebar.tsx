
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  Home,
  Receipt
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Ventas', href: '/sales', icon: ShoppingCart },
  { name: 'Inventario', href: '/inventory', icon: Package },
  { name: 'Clientes', href: '/customers', icon: Users },
  { name: 'Reportes', href: '/reports', icon: BarChart3 },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="bg-slate-900 text-white w-64 min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8">
        <Receipt className="h-8 w-8 text-blue-400" />
        <h1 className="text-xl font-bold">POS System</h1>
      </div>
      
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <div className="border-t border-slate-700 pt-4">
          <div className="text-sm text-slate-400">
            <p>Usuario: Admin</p>
            <p>Turno: Abierto</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

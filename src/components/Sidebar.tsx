
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
  Receipt,
  Clock,
  User
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
    <div className="bg-slate-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-8 w-8 text-blue-400" />
          <h1 className="text-xl font-bold">Sistema POS</h1>
        </div>
        
        {/* Usuario actual */}
        <div className="bg-slate-700 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-slate-300" />
            <span className="text-sm text-slate-300">Usuario Activo</span>
          </div>
          <p className="font-medium">DARIEL GRULLON</p>
          <p className="text-xs text-slate-400">Administrador</p>
        </div>

        {/* Estado del turno */}
        <div className="bg-green-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Turno Abierto</span>
          </div>
          <p className="text-xs">Caja #01 - Iniciado: 08:00 AM</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="text-sm text-slate-400">
          <p>Versión: 2.1.0</p>
          <p>Licencia: Activa</p>
          <p className="text-xs mt-2 text-slate-500">
            © 2025 Sistema POS Profesional
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

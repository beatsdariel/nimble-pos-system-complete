
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Receipt, Lock, User, Search } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const LoginForm = () => {
  const [loginMode, setLoginMode] = useState<'traditional' | 'accessKey'>('accessKey');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [accessKey, setAccessKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithAccessKey, searchUsers } = useAuth();

  const filteredUsers = searchUsers(searchTerm);

  const handleAccessKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || accessKey.length !== 4) {
      toast({
        title: "Error",
        description: "Selecciona un usuario e ingresa una clave de acceso válida",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await loginWithAccessKey(selectedUser.id, accessKey);
      if (success) {
        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido ${selectedUser.name}`,
        });
      } else {
        toast({
          title: "Error de autenticación",
          description: "Clave de acceso incorrecta",
          variant: "destructive",
        });
        setAccessKey('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTraditionalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido al sistema POS",
        });
      } else {
        toast({
          title: "Error de autenticación",
          description: "Usuario o contraseña incorrectos",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectUser = (user: any) => {
    setSelectedUser(user);
    setSearchTerm(user.name);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Receipt className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Sistema POS</CardTitle>
          <p className="text-gray-600">Inicia sesión para continuar</p>
        </CardHeader>
        
        <CardContent>
          {/* Toggle between login modes */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginMode('accessKey')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMode === 'accessKey'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Clave de Acceso
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('traditional')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMode === 'traditional'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Usuario/Contraseña
            </button>
          </div>

          {loginMode === 'accessKey' ? (
            <form onSubmit={handleAccessKeyLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userSearch">Buscar Usuario</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="userSearch"
                    type="text"
                    placeholder="Busca por nombre o usuario"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSelectedUser(null);
                    }}
                    className="pl-10"
                  />
                </div>
                
                {/* User search results */}
                {searchTerm && !selectedUser && filteredUsers.length > 0 && (
                  <div className="border rounded-md bg-white shadow-sm max-h-32 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => selectUser(user)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.username} - {user.role === 'admin' ? 'Administrador' : 'Empleado'}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedUser && (
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900">{selectedUser.name}</div>
                        <div className="text-sm text-blue-600">{selectedUser.role === 'admin' ? 'Administrador' : 'Empleado'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accessKey">Clave de Acceso (4 dígitos)</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={accessKey}
                    onChange={(value) => setAccessKey(value)}
                    disabled={!selectedUser}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !selectedUser || accessKey.length !== 4}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleTraditionalLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-sm text-gray-600">
            <p className="font-medium">Usuarios de prueba:</p>
            <p>• Administrador (Clave: 1234)</p>
            <p>• Juan Pérez (Clave: 5678)</p>
            <p>• María García (Clave: 9876)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';
import { Users, Plus, Edit, Trash2, Key, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser, generateAccessKey } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'employee' as 'admin' | 'employee',
    isActive: true,
    accessKey: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      updateUser(editingUser.id, formData);
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
      });
    } else {
      addUser(formData);
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
    }
    
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', username: '', password: '', role: 'employee', isActive: true, accessKey: '' });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      accessKey: user.accessKey || ''
    });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingUser(null);
    const newAccessKey = Math.floor(1000 + Math.random() * 9000).toString();
    setFormData({ 
      name: '', 
      username: '', 
      password: '', 
      role: 'employee', 
      isActive: true, 
      accessKey: newAccessKey 
    });
    setShowModal(true);
  };

  const handleGenerateAccessKey = (userId: string) => {
    const newKey = generateAccessKey(userId);
    toast({
      title: "Clave de acceso generada",
      description: `Nueva clave de acceso: ${newKey}`,
    });
  };

  const handleDelete = (userId: string) => {
    deleteUser(userId);
    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado exitosamente",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Usuarios
            </CardTitle>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Usuario</th>
                  <th className="text-left p-2">Rol</th>
                  <th className="text-center p-2">Estado</th>
                  <th className="text-center p-2">Clave de Acceso</th>
                  <th className="text-center p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{user.name}</td>
                    <td className="p-2">{user.username}</td>
                    <td className="p-2">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                          {user.accessKey || '----'}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateAccessKey(user.id)}
                          title="Generar nueva clave"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(user.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select value={formData.role} onValueChange={(value: 'admin' | 'employee') => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="employee">Empleado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="accessKey">Clave de Acceso (4 dígitos)</Label>
              <div className="flex gap-2">
                <Input
                  id="accessKey"
                  value={formData.accessKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, accessKey: e.target.value }))}
                  maxLength={4}
                  pattern="[0-9]{4}"
                  placeholder="1234"
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newKey = Math.floor(1000 + Math.random() * 9000).toString();
                    setFormData(prev => ({ ...prev, accessKey: newKey }));
                  }}
                >
                  <Key className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <Label htmlFor="isActive">Usuario Activo</Label>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingUser ? 'Actualizar' : 'Crear'} Usuario
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserManagement;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RolePermissionEditor } from '@/components/admin/RolePermissionEditor';
import { getRoleById, updateRole, getPermissions } from '@/api/roles';
import { ArrowLeft, Save, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
  _id: string;
  resource: string;
  resourceGroup: string;
  label: string;
  description: string;
  availableActions: Array<{
    action: string;
    label: string;
    description: string;
  }>;
}

interface ResourcePermission {
  resource: string;
  actions: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
    publish?: boolean;
    moderate?: boolean;
    export?: boolean;
    import?: boolean;
    approve?: boolean;
  };
  scope: 'none' | 'own' | 'department' | 'all';
}

interface Role {
  _id: string;
  name: string;
  slug: string;
  description: string;
  permissions: ResourcePermission[];
  priority: number;
  isSystem: boolean;
  isActive: boolean;
  color?: string;
}

const AdminRoleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);

  // Formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState<ResourcePermission[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roleData, permissionsData] = await Promise.all([
        getRoleById(id!),
        getPermissions(),
      ]);

      if (roleData.success && roleData.data) {
        const roleInfo = roleData.data;
        setRole(roleInfo);
        setName(roleInfo.name);
        setDescription(roleInfo.description || '');
        setPriority(roleInfo.priority || 0);
        setIsActive(roleInfo.isActive);
        setPermissions(roleInfo.permissions || []);
      }

      if (permissionsData.success && permissionsData.data) {
        setAvailablePermissions(permissionsData.data);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.response?.data?.message || 'Error al carregar les dades del rol');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('El nom del rol és obligatori');
      return;
    }

    if (!id) {
      toast.error('ID del rol no trobat');
      return;
    }

    try {
      setSaving(true);

      const updates = {
        name: name.trim(),
        description: description.trim(),
        priority,
        isActive,
        permissions: permissions.filter((p) =>
          Object.values(p.actions).some((v) => v === true)
        ),
      };

      const response = await updateRole(id, updates);

      if (response.success) {
        toast.success(response.message);
        navigate('/admin/roles');
      }
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.message || 'Error al actualitzar el rol');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregant rol...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Rol no trobat</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  El rol que intentes editar no existeix o no tens permisos per veure'l.
                </p>
                <Link to="/admin/roles">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Tornar a Rols
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Verificar si es un rol del sistema
  if (role.isSystem) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Rol del Sistema</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Els rols del sistema no es poden editar directament. Si necessites un rol
                  personalitzat, clona aquest rol des de la pàgina principal.
                </p>
                <Link to="/admin/roles">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Tornar a Rols
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/roles">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield className="h-8 w-8" />
                Editar Rol
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Modifica la configuració i permisos del rol personalitzat
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/roles">
              <Button variant="outline">Cancel·lar</Button>
            </Link>
            <Button onClick={handleSubmit} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Desant...' : 'Desar Canvis'}
            </Button>
          </div>
        </div>

        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Informació Bàsica</CardTitle>
            <CardDescription>Configuració general del rol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nom del Rol <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Editor de Contingut"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (només lectura)</Label>
                <Input id="slug" value={role.slug} disabled className="bg-gray-100" />
                <p className="text-xs text-gray-500">
                  El slug es genera automàticament i no es pot modificar
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripció</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripció del rol i les seves responsabilitats..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioritat</Label>
                <Input
                  id="priority"
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500">
                  Major número = major prioritat (0-100)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Estat</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    {isActive ? (
                      <Badge className="bg-green-100 text-green-800">Actiu</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactiu</Badge>
                    )}
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  Els rols inactius no es poden assignar a usuaris
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor de permisos */}
        <Card>
          <CardHeader>
            <CardTitle>Permisos del Rol</CardTitle>
            <CardDescription>
              Configura els permisos i àmbits d'accés per a aquest rol. Els permisos determinen
              quines accions pot realitzar l'usuari i sobre quins recursos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RolePermissionEditor
              availablePermissions={availablePermissions}
              currentPermissions={permissions}
              onChange={setPermissions}
            />
          </CardContent>
        </Card>

        {/* Botones de acción inferiores */}
        <div className="flex justify-end gap-2 pb-6">
          <Link to="/admin/roles">
            <Button variant="outline">Cancel·lar</Button>
          </Link>
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Desant...' : 'Desar Canvis'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminRoleEdit;

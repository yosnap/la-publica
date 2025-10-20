import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Edit,
  Trash2,
  Copy,
  Eye,
  Users,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/PageWrapper';
import {
  getRoles,
  deleteRole,
  cloneRole,
  type Role
} from '@/api/roles';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'custom'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles({
        includeInactive: true,
        includeSystem: true
      });

      if (response.success) {
        setRoles(response.data);
      }
    } catch (error: any) {
      console.error('Error loading roles:', error);
      toast.error('Error al carregar els rols');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    try {
      const response = await deleteRole(roleId);

      if (response.success) {
        toast.success(response.message);
        loadRoles();
      }
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el rol');
    }
  };

  const handleClone = async () => {
    if (!selectedRole || !newRoleName.trim()) {
      toast.error('Has de proporcionar un nom per al nou rol');
      return;
    }

    try {
      const response = await cloneRole(selectedRole._id, newRoleName);

      if (response.success) {
        toast.success(response.message);
        setCloneDialogOpen(false);
        setNewRoleName('');
        setSelectedRole(null);
        loadRoles();
      }
    } catch (error: any) {
      console.error('Error cloning role:', error);
      toast.error(error.response?.data?.message || 'Error al clonar el rol');
    }
  };

  const openCloneDialog = (role: Role) => {
    setSelectedRole(role);
    setNewRoleName(`${role.name} (Copia)`);
    setCloneDialogOpen(true);
  };

  const openViewDialog = (role: Role) => {
    setSelectedRole(role);
    setViewDialogOpen(true);
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'system') return matchesSearch && role.isSystemRole;
    if (activeTab === 'custom') return matchesSearch && !role.isSystemRole;
    return matchesSearch;
  });

  const stats = {
    total: roles.length,
    system: roles.filter(r => r.isSystemRole).length,
    custom: roles.filter(r => !r.isSystemRole).length,
    active: roles.filter(r => r.isActive).length
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield className="h-8 w-8" />
                Gestió de Rols i Permisos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Administra els rols i permisos del sistema
              </p>
            </div>
          </div>

          {/* Navegación de pestañas */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <Link to="/admin/roles">
              <Button
                variant="ghost"
                className="rounded-none border-b-2 border-primary text-primary px-6 py-2"
              >
                Rols
              </Button>
            </Link>
            <Link to="/admin/permissions">
              <Button
                variant="ghost"
                className="rounded-none border-b-2 border-transparent hover:border-gray-300 px-6 py-2"
              >
                Permisos
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Shield className="h-8 w-8 text-blue-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total Rols</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats.system}</p>
                  <p className="text-sm text-gray-500">Rols del Sistema</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-purple-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats.custom}</p>
                  <p className="text-sm text-gray-500">Rols Personalitzats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Activity className="h-8 w-8 text-orange-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-gray-500">Actius</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Buscar rols..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                <TabsList>
                  <TabsTrigger value="all">Tots</TabsTrigger>
                  <TabsTrigger value="system">Sistema</TabsTrigger>
                  <TabsTrigger value="custom">Personalitzats</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Roles List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregant rols...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No s'han trobat rols</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => (
              <Card key={role._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {role.name}
                        {role.isSystemRole && (
                          <Badge variant="secondary">Sistema</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {role.description || 'Sense descripció'}
                      </p>
                    </div>
                    {role.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Prioritat:</span>
                      <Badge>{role.priority}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Permisos:</span>
                      <span className="font-medium">{role.permissions.length} recursos</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Slug:</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{role.slug}</code>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openViewDialog(role)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Veure
                      </Button>
                      {!role.isSystemRole && (
                        <>
                          <Link to={`/admin/roles/${role._id}/edit`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar rol</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Estàs segur que vols eliminar el rol "{role.name}"? Aquesta acció
                                  desactivarà el rol però no l'eliminarà permanentment.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(role._id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCloneDialog(role)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Clone Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clonar Rol</DialogTitle>
            <DialogDescription>
              Crea una còpia del rol "{selectedRole?.name}" amb un nou nom
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newRoleName">Nom del nou rol</Label>
              <Input
                id="newRoleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Nom del rol"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneDialogOpen(false)}>
              Cancel·lar
            </Button>
            <Button onClick={handleClone}>
              Clonar Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>
              Detalls del rol i permisos assignats
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Slug</Label>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                    {selectedRole.slug}
                  </p>
                </div>
                <div>
                  <Label>Prioritat</Label>
                  <p className="text-sm mt-1">{selectedRole.priority}</p>
                </div>
                <div>
                  <Label>Tipus</Label>
                  <p className="text-sm mt-1">
                    {selectedRole.isSystemRole ? 'Rol del Sistema' : 'Rol Personalitzat'}
                  </p>
                </div>
                <div>
                  <Label>Estat</Label>
                  <p className="text-sm mt-1">
                    {selectedRole.isActive ? (
                      <Badge className="bg-green-500">Actiu</Badge>
                    ) : (
                      <Badge variant="secondary">Inactiu</Badge>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <Label>Descripció</Label>
                <p className="text-sm mt-1 text-gray-600">
                  {selectedRole.description || 'Sense descripció'}
                </p>
              </div>

              <div>
                <Label className="mb-3 block">Permisos ({selectedRole.permissions.length})</Label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedRole.permissions.map((perm, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{perm.resource}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(perm.actions)
                                .filter(([_, value]) => value)
                                .map(([action]) => (
                                  <Badge key={action} variant="outline" className="text-xs">
                                    {action}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                          <Badge className="ml-2">{perm.scope}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

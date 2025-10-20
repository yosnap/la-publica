import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Unlock,
  Search,
  RefreshCw,
  User,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/PageWrapper';
import {
  getGroupedPermissions,
  getUserPermissions,
  getMyPermissions,
  invalidateAllCache,
  type Permission
} from '@/api/roles';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminPermissions() {
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [myPermissions, setMyPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userPermDialogOpen, setUserPermDialogOpen] = useState(false);
  const [selectedUserPerms, setSelectedUserPerms] = useState<any>(null);
  const [loadingUserPerms, setLoadingUserPerms] = useState(false);
  const [showInvalidateDialog, setShowInvalidateDialog] = useState(false);

  useEffect(() => {
    loadPermissions();
    loadMyPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await getGroupedPermissions();

      if (response.success) {
        setGroupedPermissions(response.data);
      }
    } catch (error: any) {
      console.error('Error loading permissions:', error);
      toast.error('Error al carregar els permisos');
    } finally {
      setLoading(false);
    }
  };

  const loadMyPermissions = async () => {
    try {
      const response = await getMyPermissions();

      if (response.success) {
        setMyPermissions(response.data.permissions);
      }
    } catch (error: any) {
      console.error('Error loading my permissions:', error);
    }
  };

  const loadUserPermissions = async (userId: string) => {
    try {
      setLoadingUserPerms(true);
      const response = await getUserPermissions(userId);

      if (response.success) {
        setSelectedUserPerms(response.data);
        setUserPermDialogOpen(true);
      }
    } catch (error: any) {
      console.error('Error loading user permissions:', error);
      toast.error('Error al carregar els permisos de l\'usuari');
    } finally {
      setLoadingUserPerms(false);
    }
  };

  const handleInvalidateCache = async () => {
    try {
      const response = await invalidateAllCache();

      if (response.success) {
        toast.success(response.message);
        setShowInvalidateDialog(false);
      }
    } catch (error: any) {
      console.error('Error invalidating cache:', error);
      toast.error('Error al invalidar la cache');
    }
  };

  const filteredGroups = Object.keys(groupedPermissions).filter(group =>
    group.toLowerCase().includes(searchTerm.toLowerCase()) ||
    groupedPermissions[group].some(perm =>
      perm.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPermissions = Object.values(groupedPermissions).reduce(
    (acc, perms) => acc + perms.length,
    0
  );

  const getGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      content: 'bg-blue-100 text-blue-800',
      business: 'bg-green-100 text-green-800',
      users: 'bg-purple-100 text-purple-800',
      system: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[group] || 'bg-gray-100 text-gray-800';
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
            <AlertDialog open={showInvalidateDialog} onOpenChange={setShowInvalidateDialog}>
              <Button variant="outline" onClick={() => setShowInvalidateDialog(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Invalidar Caché
              </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Invalidar Caché de Permisos</AlertDialogTitle>
                <AlertDialogDescription>
                  Això forçarà a recalcular tots els permisos la pròxima vegada que es consultin.
                  Útil després de fer canvis importants en els rols.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                <AlertDialogAction onClick={handleInvalidateCache}>
                  Invalidar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>

          {/* Navegación de pestañas */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <Link to="/admin/roles">
              <Button
                variant="ghost"
                className="rounded-none border-b-2 border-transparent hover:border-gray-300 px-6 py-2"
              >
                Rols
              </Button>
            </Link>
            <Link to="/admin/permissions">
              <Button
                variant="ghost"
                className="rounded-none border-b-2 border-primary text-primary px-6 py-2"
              >
                Permisos
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Shield className="h-8 w-8 text-blue-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{totalPermissions}</p>
                  <p className="text-sm text-gray-500">Total Permisos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Lock className="h-8 w-8 text-purple-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{Object.keys(groupedPermissions).length}</p>
                  <p className="text-sm text-gray-500">Grups de Recursos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <User className="h-8 w-8 text-green-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {myPermissions ? Object.keys(myPermissions).length : 0}
                  </p>
                  <p className="text-sm text-gray-500">Els Meus Permisos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar permisos o recursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Els Meus Permisos */}
        {myPermissions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Els Meus Permisos Actius
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(myPermissions).map(([resource, perm]: [string, any]) => (
                  <Card key={resource} className="bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{resource}</p>
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
                        <Badge className="ml-2 text-xs">{perm.scope}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Permissions by Group */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregant permisos...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Lock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No s'han trobat permisos</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Catàleg de Permisos per Grup</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {filteredGroups.map((group) => (
                  <AccordionItem key={group} value={group}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <Badge className={getGroupColor(group)}>
                          {group}
                        </Badge>
                        <span className="text-gray-500 text-sm">
                          {groupedPermissions[group].length} recursos
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-3">
                        {groupedPermissions[group].map((permission) => (
                          <Card key={permission._id}>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{permission.label}</h4>
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                                      {permission.resource}
                                    </code>
                                  </div>
                                  <Badge variant={permission.isActive ? 'default' : 'secondary'}>
                                    {permission.isActive ? 'Actiu' : 'Inactiu'}
                                  </Badge>
                                </div>

                                {permission.description && (
                                  <p className="text-sm text-gray-600">
                                    {permission.description}
                                  </p>
                                )}

                                <div>
                                  <Label className="text-xs text-gray-500">Accions disponibles:</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {permission.availableActions.map((action) => (
                                      <div
                                        key={action.action}
                                        className="bg-white border rounded-lg px-3 py-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline">{action.action}</Badge>
                                          <div>
                                            <p className="text-xs font-medium">{action.label}</p>
                                            {action.description && (
                                              <p className="text-xs text-gray-500">
                                                {action.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Permissions Dialog */}
      <Dialog open={userPermDialogOpen} onOpenChange={setUserPermDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Permisos de l'Usuari</DialogTitle>
            <DialogDescription>
              {selectedUserPerms?.userName} ({selectedUserPerms?.userEmail})
            </DialogDescription>
          </DialogHeader>
          {selectedUserPerms && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(selectedUserPerms.permissions).map(([resource, perm]: [string, any]) => (
                  <Card key={resource}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{resource}</p>
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
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

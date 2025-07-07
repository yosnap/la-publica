import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Settings, 
  Users, 
  BarChart3, 
  Edit, 
  Trash2, 
  Crown, 
  Shield, 
  UserMinus,
  MoreHorizontal,
  UserPlus,
  Image,
  Save,
  X,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { RulesRepeater } from "@/components/ui/rules-repeater";
import { TransferOwnershipModal } from "@/components/groups/TransferOwnershipModal";
import {
  fetchGroupById,
  updateGroup,
  updateMemberRole,
  removeMember,
  getGroupStats,
  transferOwnership,
  deleteGroup,
  fetchGroupCategories,
  type Group,
  type GroupCategory
} from "@/api/groups";
import { getImageUrl } from "@/utils/getImageUrl";

const GroupAdmin = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [categories, setCategories] = useState<GroupCategory[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Form state for editing group
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    privacy: "public" as "public" | "private",
    tags: [] as string[],
    rules: [] as string[],
    location: "",
    website: "",
    image: "",
    coverImage: ""
  });

  useEffect(() => {
    if (id) {
      loadGroupData();
      loadCategories();
    }
  }, [id]);

  const loadGroupData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [groupResponse, statsResponse] = await Promise.all([
        fetchGroupById(id),
        getGroupStats(id).catch(() => ({ success: false, data: null }))
      ]);

      if (groupResponse.success) {
        setGroup(groupResponse.data);
        setFormData({
          name: groupResponse.data.name,
          description: groupResponse.data.description,
          category: typeof groupResponse.data.category === 'object' 
            ? groupResponse.data.category._id 
            : groupResponse.data.category,
          privacy: groupResponse.data.privacy,
          tags: groupResponse.data.tags || [],
          rules: groupResponse.data.rules || [],
          location: groupResponse.data.location || "",
          website: groupResponse.data.website || "",
          image: groupResponse.data.image || "",
          coverImage: groupResponse.data.coverImage || ""
        });
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error: any) {
      console.error("Error loading group data:", error);
      if (error.response?.status === 403) {
        toast.error("No tienes permisos para administrar este grupo");
        navigate(`/groups/${id}`);
      } else {
        toast.error("Error al cargar los datos del grupo");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetchGroupCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleSaveChanges = async () => {
    if (!group || !id) return;

    try {
      setSaving(true);
      const response = await updateGroup(id, formData);
      if (response.success) {
        setGroup(response.data);
        setEditMode(false);
        toast.success("Grupo actualizado exitosamente");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar el grupo");
    } finally {
      setSaving(false);
    }
  };

  const handleMemberRoleChange = async (memberId: string, newRole: string) => {
    if (!group || !id) return;

    try {
      const response = await updateMemberRole(id, memberId, newRole);
      if (response.success) {
        setGroup(response.data);
        toast.success("Rol actualizado exitosamente");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar el rol");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!group || !id) return;

    try {
      const response = await removeMember(id, memberId);
      if (response.success) {
        setGroup(response.data);
        toast.success("Miembro removido exitosamente");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al remover miembro");
    }
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    if (!group || !id) return;

    try {
      const response = await transferOwnership(id, newOwnerId);
      if (response.success) {
        setGroup(response.data);
        toast.success("Propiedad transferida exitosamente");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al transferir propiedad");
    }
  };

  const handleDeleteGroup = async () => {
    if (!group || !id) return;

    try {
      const response = await deleteGroup(id);
      if (response.success) {
        toast.success("Grupo eliminado exitosamente");
        navigate("/groups");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar el grupo");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Admin";
      case "moderator": return "Moderador";
      case "member": return "Miembro";
      default: return "Miembro";
    }
  };

  const canEditGroup = group?.userRole === "admin";
  const isOwner = group?.creator?._id === group?.members?.find(m => m.role === 'admin')?.user._id;

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!group) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Grupo no encontrado</h2>
          <Button onClick={() => navigate('/groups')}>
            Volver a Grupos
          </Button>
        </div>
      </PageWrapper>
    );
  }

  if (!canEditGroup) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso denegado</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para administrar este grupo</p>
          <Button onClick={() => navigate(`/groups/${id}`)}>
            Ver Grupo
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/groups/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administrar Grupo</h1>
              <p className="text-gray-600">{group.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!editMode ? (
              <Button onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveChanges} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid grid-cols-3 bg-white border">
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Configuración
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Miembros ({group.memberCount})
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Grupo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {editMode ? (
                  // Edit form
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Nombre del grupo
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nombre del grupo"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Categoría
                        </label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                <div className="flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Descripción
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción del grupo"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Privacidad
                        </label>
                        <Select
                          value={formData.privacy}
                          onValueChange={(value: "public" | "private") => 
                            setFormData(prev => ({ ...prev, privacy: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Público</SelectItem>
                            <SelectItem value="private">Privado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Ubicación
                        </label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Ubicación del grupo"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Sitio web
                      </label>
                      <Input
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://ejemplo.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Imagen del grupo
                        </label>
                        <ImageUpload
                          value={formData.image}
                          onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                          placeholder="Subir imagen del grupo"
                          aspectRatio="square"
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Imagen de portada
                        </label>
                        <ImageUpload
                          value={formData.coverImage}
                          onChange={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
                          placeholder="Subir imagen de portada"
                          aspectRatio="cover"
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <RulesRepeater
                      value={formData.rules}
                      onChange={(rules) => setFormData(prev => ({ ...prev, rules }))}
                      disabled={saving}
                    />
                  </div>
                ) : (
                  // Read-only view
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Información básica</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-500">Nombre:</span> {group.name}</div>
                          <div><span className="text-gray-500">Categoría:</span> {typeof group.category === 'object' ? group.category.name : 'Sin categoría'}</div>
                          <div><span className="text-gray-500">Privacidad:</span> {group.privacy === 'private' ? 'Privado' : 'Público'}</div>
                          {group.location && <div><span className="text-gray-500">Ubicación:</span> {group.location}</div>}
                          {group.website && (
                            <div>
                              <span className="text-gray-500">Sitio web:</span>{" "}
                              <a href={group.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {group.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Estadísticas</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-500">Miembros:</span> {group.memberCount}</div>
                          <div><span className="text-gray-500">Posts:</span> {group.postCount}</div>
                          <div><span className="text-gray-500">Creado:</span> {new Date(group.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Descripción</h3>
                      <p className="text-gray-700 text-sm">{group.description}</p>
                    </div>

                    {group.rules && group.rules.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Reglas del grupo</h3>
                        <ul className="space-y-1">
                          {group.rules.map((rule, index) => (
                            <li key={index} className="text-sm text-gray-700 flex">
                              <span className="mr-2 text-gray-400">{index + 1}.</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Dangerous actions */}
                {isOwner && !editMode && (
                  <div className="border-t pt-6">
                    <h3 className="font-medium text-red-600 mb-4">Zona peligrosa</h3>
                    <div className="space-y-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar grupo
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el grupo 
                              y todos sus datos asociados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteGroup}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar grupo
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Miembros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.members.map((member) => (
                    <div key={member.user._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={getImageUrl(member.user.profilePicture)} />
                          <AvatarFallback>
                            {member.user.firstName[0]}{member.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {member.user.firstName} {member.user.lastName}
                            </span>
                            {getRoleIcon(member.role)}
                            {group.creator._id === member.user._id && (
                              <Badge variant="outline" className="text-xs">Fundador</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Badge 
                              variant={member.role === 'admin' ? 'default' : 'secondary'}
                              className={
                                member.role === 'admin' ? 'bg-yellow-100 text-yellow-800' :
                                member.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {getRoleLabel(member.role)}
                            </Badge>
                            <span>
                              Se unió {new Date(member.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions for members (except creator) */}
                      {group.creator._id !== member.user._id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {member.role !== 'admin' && (
                              <DropdownMenuItem 
                                onClick={() => handleMemberRoleChange(member.user._id, 'admin')}
                              >
                                <Crown className="h-4 w-4 mr-2" />
                                Hacer Admin
                              </DropdownMenuItem>
                            )}
                            {member.role !== 'moderator' && member.role !== 'admin' && (
                              <DropdownMenuItem 
                                onClick={() => handleMemberRoleChange(member.user._id, 'moderator')}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Hacer Moderador
                              </DropdownMenuItem>
                            )}
                            {member.role !== 'member' && (
                              <DropdownMenuItem 
                                onClick={() => handleMemberRoleChange(member.user._id, 'member')}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Hacer Miembro
                              </DropdownMenuItem>
                            )}
                            {isOwner && member.role === 'admin' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setShowTransferModal(true)}
                                  className="text-orange-600"
                                >
                                  <Crown className="h-4 w-4 mr-2" />
                                  Transferir propiedad
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleRemoveMember(member.user._id)}
                              className="text-red-600"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remover del grupo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats && (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Miembros</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <UserPlus className="h-8 w-8 text-green-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Nuevos (30 días)</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.newMembersLast30Days}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <BarChart3 className="h-8 w-8 text-purple-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Posts</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                      <CardTitle>Distribución de Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{stats.membersByRole.admin}</div>
                          <div className="text-sm text-gray-600">Administradores</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.membersByRole.moderator}</div>
                          <div className="text-sm text-gray-600">Moderadores</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">{stats.membersByRole.member}</div>
                          <div className="text-sm text-gray-600">Miembros</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Transfer Ownership Modal */}
        {group && (
          <TransferOwnershipModal
            open={showTransferModal}
            onOpenChange={setShowTransferModal}
            group={group}
            onTransfer={handleTransferOwnership}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default GroupAdmin;
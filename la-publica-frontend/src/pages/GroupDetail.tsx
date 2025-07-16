import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Users, 
  Settings, 
  Crown, 
  Shield, 
  Globe, 
  Lock, 
  Calendar, 
  MapPin, 
  ExternalLink,
  UserPlus,
  UserMinus,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageWrapper } from "@/components/PageWrapper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { CreateGroupPost } from "@/components/groups/CreateGroupPost";
import { GroupPostCard } from "@/components/groups/GroupPostCard";
import {
  fetchGroupById,
  joinGroup,
  leaveGroup,
  updateMemberRole,
  type Group
} from "@/api/groups";
import {
  fetchGroupPosts,
  type GroupPost
} from "@/api/groupPosts";
import { getImageUrl } from "@/utils/getImageUrl";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadGroupDetails();
      loadUserProfile();
    }
  }, [id]);

  useEffect(() => {
    if (id && group) {
      loadGroupPosts();
    }
  }, [id, group]);

  const loadGroupDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetchGroupById(id);
      if (response.success) {
        setGroup(response.data);
      }
    } catch (error: any) {
      console.error("Error loading group details:", error);
      if (error.response?.status === 404) {
        toast.error("Grupo no encontrado");
        navigate('/groups');
      } else if (error.response?.status === 403) {
        toast.error("No tienes permisos para ver este grupo privado");
        navigate('/groups');
      } else {
        toast.error("Error al cargar los detalles del grupo");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
       // Obtener perfil del usuario actual para tener su información
      const token = localStorage.getItem('authToken');
      if (token) {
         // Extraer userId del token
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
        
         // Obtener perfil completo del usuario
        import('@/api/client').then(({ default: apiClient }) => {
          apiClient.get('/users/profile').then(response => {
            if (response.data.success) {
              setUserProfile(response.data.data);
            }
          }).catch(error => {
            console.error("Error loading user profile:", error);
          });
        });
      }
    } catch (error) {
      console.error("Error parsing token:", error);
    }
  };

  const loadGroupPosts = async () => {
    if (!id) return;
    
    try {
      setLoadingPosts(true);
      const response = await fetchGroupPosts(id, { page: 1, limit: 20 });
      if (response.success) {
        setPosts(response.data);
      }
    } catch (error: any) {
      console.error("Error loading group posts:", error);
      if (error.response?.status !== 403) {
        toast.error("Error al cargar los posts del grupo");
      }
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!group) return;
    
    try {
      setJoining(true);
      const response = await joinGroup(group._id);
      if (response.success) {
        toast.success("Te has unido al grupo exitosamente");
        loadGroupDetails();  // Recargar para actualizar el estado
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al unirse al grupo");
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    if (!confirm("¿Estás seguro de que quieres salir de este grupo?")) return;
    
    try {
      setLeaving(true);
      const response = await leaveGroup(group._id);
      if (response.success) {
        toast.success("Has salido del grupo");
        navigate('/groups');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al salir del grupo");
    } finally {
      setLeaving(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!group) return;
    
    try {
      const response = await updateMemberRole(group._id, memberId, newRole);
      if (response.success) {
        toast.success("Rol actualizado exitosamente");
        loadGroupDetails();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar el rol");
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

  const canManageMembers = group?.userRole === "admin";
  const isMember = !!group?.userRole;

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
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

  return (
    <PageWrapper>
      <div className="space-y-6">
        { /* Header del grupo */}
        <div className="relative">
          { /* Imagen de portada */}
          {group.coverImage ? (
            <div className="h-48 w-full rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
              <img 
                src={getImageUrl(group.coverImage)} 
                alt="Portada del grupo"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-48 w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600" />
          )}
          
          { /* Información del grupo superpuesta */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl p-6">
            <div className="flex items-end space-x-4">
              { /* Imagen del grupo */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border-4 border-white">
                {group.image ? (
                  <img 
                    src={getImageUrl(group.image)} 
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              
              { /* Información básica */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-white truncate">{group.name}</h1>
                  {group.privacy === "private" && (
                    <Badge variant="secondary" className="bg-white /20 text-white border-white/30">
                      <Lock className="h-3 w-3 mr-1" />
                      Privado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-white/90 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {group.memberCount} miembros
                  </div>
                  {group.category && typeof group.category === 'object' && (
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-1"
                        style={{ backgroundColor: group.category.color }}
                      />
                      {group.category.name}
                    </div>
                  )}
                </div>
              </div>
              
              { /* Acciones */}
              <div className="flex items-center space-x-2">
                {!isMember ? (
                  <Button 
                    onClick={handleJoinGroup}
                    disabled={joining}
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {joining ? "Uniéndose..." : "Unirse al Grupo"}
                  </Button>
                ) : (
                  <>
                    {group.userRole === "admin" && (
                      <Button 
                        variant="secondary" 
                        className="bg-white /20 text-white hover:bg-white/30"
                        onClick={() => navigate(`/groups/${id}/admin`)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Administrar
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" className="bg-white /20 text-white hover:bg-white/30">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleLeaveGroup} disabled={leaving}>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Salir del Grupo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        { /* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          { /* Contenido principal */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="posts" className="space-y-6">
              <TabsList className="grid grid-cols-3 bg-white border">
                <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Posts ({group.postCount})
                </TabsTrigger>
                <TabsTrigger value="about" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Acerca de
                </TabsTrigger>
                <TabsTrigger value="members" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Miembros ({group.memberCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-6">
                { /* Create post (only for members) */}
                {isMember && userProfile && (
                  <CreateGroupPost
                    groupId={group._id}
                    groupName={group.name}
                    userProfilePicture={userProfile.profilePicture}
                    userFirstName={userProfile.firstName}
                    userLastName={userProfile.lastName}
                    onPostCreated={loadGroupPosts}
                  />
                )}

                { /* Posts feed */}
                {loadingPosts ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="shadow-sm border-0 bg-white">
                        <CardContent className="p-6">
                          <div className="animate-pulse">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded"></div>
                              <div className="h-4 bg-gray-200 rounded w-5 /6"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="text-gray-400 mb-4">📝</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isMember ? "Sé el primero en publicar" : "No hay posts aún"}
                      </h3>
                      <p className="text-gray-500">
                        {isMember 
                          ? "Comparte algo interesante con el grupo."
                          : "Los posts del grupo aparecerán aquí cuando los miembros publiquen contenido."
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <GroupPostCard
                        key={post._id}
                        post={post}
                        currentUserId={currentUserId}
                        userGroupRole={group.userRole}
                        onPostUpdate={loadGroupPosts}
                        onPostDelete={loadGroupPosts}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>Descripción</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">{group.description}</p>
                    
                    { /* Tags */}
                    {group.tags && group.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {group.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    { /* Reglas */}
                    {group.rules && group.rules.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Reglas del Grupo</h4>
                        <ul className="space-y-1">
                          {group.rules.map((rule, index) => (
                            <li key={index} className="text-sm text-gray-600 flex">
                              <span className="mr-2 text-gray-400">{index + 1}.</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    { /* Información adicional */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      {group.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{group.location}</span>
                        </div>
                      )}
                      {group.website && (
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                          <a 
                            href={group.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Sitio web
                          </a>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Creado {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members">
                <Card>
                  <CardHeader>
                    <CardTitle>Miembros ({group.memberCount})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.members.map((member) => (
                        <div key={member.user._id} className="flex items-center justify-between p-3 border rounded-lg">
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
                          
                          {canManageMembers && member.role !== 'admin' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {member.role !== 'moderator' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleRoleChange(member.user._id, 'moderator')}
                                  >
                                    Hacer Moderador
                                  </DropdownMenuItem>
                                )}
                                {member.role === 'moderator' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleRoleChange(member.user._id, 'member')}
                                  >
                                    Quitar Moderador
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          { /* Sidebar */}
          <div className="space-y-4">
            { /* Información del creador */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Creado por</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={getImageUrl(group.creator.profilePicture)} />
                    <AvatarFallback>
                      {group.creator.firstName[0]}{group.creator.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {group.creator.firstName} {group.creator.lastName}
                    </div>
                    <div className="text-sm text-gray-500">Fundador</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            { /* Estadísticas rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Miembros</span>
                  <span className="font-medium">{group.memberCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Posts</span>
                  <span className="font-medium">{group.postCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Privacidad</span>
                  <span className="font-medium flex items-center">
                    {group.privacy === 'private' ? (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Privado
                      </>
                    ) : (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Público
                      </>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default GroupDetail;
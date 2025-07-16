import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Search, Settings, Crown, Shield, Globe, Lock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageWrapper } from "@/components/PageWrapper";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { toast } from "sonner";
import { 
  fetchGroups, 
  fetchUserGroups, 
  fetchGroupCategories, 
  joinGroup, 
  leaveGroup,
  type Group, 
  type GroupCategory 
} from "@/api/groups";
import { getImageUrl } from "@/utils/getImageUrl";

const Groups = () => {
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<GroupCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDiscover, setLoadingDiscover] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [joiningGroups, setJoiningGroups] = useState<Set<string>>(new Set());

   // Cargar datos iniciales
  useEffect(() => {
    loadMyGroups();
    loadDiscoverGroups();
    loadCategories();
  }, []);

   // Cargar grupos del usuario
  const loadMyGroups = async () => {
    try {
      setLoading(true);
      const response = await fetchUserGroups();
      if (response.success) {
        setMyGroups(response.data);
      }
    } catch (error) {
      console.error("Error loading user groups:", error);
      toast.error("Error al cargar tus grupos");
    } finally {
      setLoading(false);
    }
  };

   // Cargar grupos para descubrir
  const loadDiscoverGroups = async () => {
    try {
      setLoadingDiscover(true);
      const params = {
        search: searchTerm || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        page: 1,
        limit: 20,
      };
      const response = await fetchGroups(params);
      if (response.success) {
        setDiscoverGroups(response.data);
      }
    } catch (error) {
      console.error("Error loading discover groups:", error);
      toast.error("Error al cargar grupos");
    } finally {
      setLoadingDiscover(false);
    }
  };

   // Cargar categorías
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

   // Unirse a un grupo
  const handleJoinGroup = async (groupId: string) => {
    try {
      setJoiningGroups(prev => new Set(prev).add(groupId));
      const response = await joinGroup(groupId);
      if (response.success) {
        toast.success("Te has unido al grupo exitosamente");
         // Actualizar las listas
        loadMyGroups();
        loadDiscoverGroups();
      }
    } catch (error: any) {
      console.error("Error joining group:", error);
      toast.error(error.response?.data?.message || "Error al unirse al grupo");
    } finally {
      setJoiningGroups(prev => {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });
    }
  };

   // Salir de un grupo
  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm("¿Estás seguro de que quieres salir de este grupo?")) return;
    
    try {
      const response = await leaveGroup(groupId);
      if (response.success) {
        toast.success("Has salido del grupo");
        loadMyGroups();
        loadDiscoverGroups();
      }
    } catch (error: any) {
      console.error("Error leaving group:", error);
      toast.error(error.response?.data?.message || "Error al salir del grupo");
    }
  };

   // Filtrar grupos por búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDiscoverGroups();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-100 text-yellow-800";
      case "moderator":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "moderator":
        return "Moderador";
      case "member":
        return "Miembro";
      default:
        return "Miembro";
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        { /* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Grupos</h1>
            <p className="text-gray-600 dark:text-gray-400">Conecta con comunidades que comparten tus intereses</p>
          </div>
          <CreateGroupModal onGroupCreated={() => { loadMyGroups(); loadDiscoverGroups(); }}>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Crear Grupo
            </Button>
          </CreateGroupModal>
        </div>

        { /* Búsqueda */}
        <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1 /2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar grupos por nombre, descripción o categoría..."
                className="pl-10 bg-gray-50 dark:bg-gray-700 /50 border-0 focus:bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </CardContent>
        </Card>

        { /* Tabs */}
        <Tabs defaultValue="my-groups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-800/50 border">
            <TabsTrigger 
              value="my-groups" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Mis Grupos ({myGroups.length})
            </TabsTrigger>
            <TabsTrigger 
              value="discover" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Descubrir
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups" className="space-y-4">
            {loading ? (
               // Skeleton loading
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1 /3" />
                        <Skeleton className="h-3 w-2 /3" />
                        <Skeleton className="h-3 w-1 /4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : myGroups.length === 0 ? (
              <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tienes grupos aún</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Únete a grupos existentes o crea tu propio grupo para conectar con personas que comparten tus intereses.
                  </p>
                  <CreateGroupModal onGroupCreated={() => { loadMyGroups(); loadDiscoverGroups(); }}>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear tu primer grupo
                    </Button>
                  </CreateGroupModal>
                </CardContent>
              </Card>
            ) : (
              myGroups.map((group) => (
                <Card key={group._id} className="shadow-sm border-0 bg-white dark:bg-gray-800/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                    { /* Imagen del grupo */}
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {group.image ? (
                        <img src={getImageUrl(group.image)} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>

                    { /* Información del grupo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{group.name}</h3>
                            {group.privacy === "private" && (
                              <Badge variant="secondary" className="text-xs flex items-center">
                                <Lock className="h-3 w-3 mr-1" />
                                Privado
                              </Badge>
                            )}
                            {group.userRole && getRoleIcon(group.userRole) && (
                              <div className="flex items-center">
                                {getRoleIcon(group.userRole)}
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">{group.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {group.memberCount} miembros
                            </div>
                            <span>•</span>
                            <span>{group.postCount} posts</span>
                            {group.category && typeof group.category === 'object' && (
                              <>
                                <span>•</span>
                                <span className="flex items-center">
                                  <div 
                                    className="w-2 h-2 rounded-full mr-1"
                                    style={{ backgroundColor: group.category.color }}
                                  />
                                  {group.category.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {group.userRole && (
                            <Badge className={getRoleBadgeColor(group.userRole)}>
                              {getRoleLabel(group.userRole)}
                            </Badge>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/groups/${group._id}`)}
                          >
                            Ver Grupo
                          </Button>
                          {group.userRole === "admin" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/groups/${group._id}/admin`)}
                              title="Administrar grupo"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            {loadingDiscover ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-16 h-16 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-2 /3" />
                          <Skeleton className="h-3 w-1 /2" />
                          <Skeleton className="h-3 w-full" />
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {discoverGroups.length === 0 ? (
                  <div className="col-span-full">
                    <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
                      <CardContent className="p-12 text-center">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {searchTerm ? "No se encontraron grupos" : "No hay grupos disponibles"}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm 
                            ? "Intenta con otros términos de búsqueda o categorías diferentes."
                            : "Sé el primero en crear un grupo para esta comunidad."
                          }
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  discoverGroups.map((group) => (
                    <Card key={group._id} className="shadow-sm border-0 bg-white dark:bg-gray-800/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {group.image ? (
                              <img src={getImageUrl(group.image)} alt={group.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                                <Users className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{group.name}</h3>
                                  {group.privacy === "private" && (
                                    <Badge variant="secondary" className="text-xs flex items-center">
                                      <Lock className="h-3 w-3 mr-1" />
                                      Privado
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                                  <Users className="h-4 w-4" />
                                  <span>{group.memberCount} miembros</span>
                                  {group.category && typeof group.category === 'object' && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center">
                                        <div 
                                          className="w-2 h-2 rounded-full mr-1"
                                          style={{ backgroundColor: group.category.color }}
                                        />
                                        {group.category.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">{group.description}</p>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => handleJoinGroup(group._id)}
                                disabled={joiningGroups.has(group._id)}
                              >
                                {joiningGroups.has(group._id) ? "Uniéndose..." : "Unirse"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/groups/${group._id}`)}
                              >
                                Ver Detalles
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            { /* Categorías Populares */}
            {categories.length > 0 && (
              <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50 mt-8">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Categorías</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <Button
                      variant={selectedCategory === "all" ? "default" : "outline"}
                      className="text-sm transition-colors"
                      onClick={() => setSelectedCategory("all")}
                    >
                      Todas
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category._id}
                        variant={selectedCategory === category._id ? "default" : "outline"}
                        className="text-sm hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setSelectedCategory(category._id)}
                        style={selectedCategory === category._id ? {} : { borderColor: category.color }}
                      >
                        <div 
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default Groups;

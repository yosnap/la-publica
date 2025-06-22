import { Users, Plus, Search, Settings, Crown, Shield } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageWrapper } from "@/components/PageWrapper";

const Groups = () => {
  const myGroups = [
    {
      id: 1,
      name: "Desarrolladores React",
      description: "Comunidad de desarrolladores especializados en React y tecnologías frontend",
      members: 234,
      posts: 45,
      role: "Admin",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop",
      isPrivate: false,
      lastActivity: "hace 2 horas"
    },
    {
      id: 2,
      name: "Marketing Digital",
      description: "Estrategias, herramientas y tendencias en marketing digital",
      members: 156,
      posts: 23,
      role: "Moderador",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop",
      isPrivate: true,
      lastActivity: "hace 1 día"
    },
    {
      id: 3,
      name: "Emprendedores Tech",
      description: "Red de emprendedores en el sector tecnológico",
      members: 89,
      posts: 12,
      role: "Miembro",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200&h=200&fit=crop",
      isPrivate: false,
      lastActivity: "hace 3 días"
    }
  ];

  const discoverGroups = [
    {
      id: 4,
      name: "UX/UI Designers",
      description: "Comunidad de diseñadores de experiencia e interfaz de usuario",
      members: 312,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop",
      isPrivate: false,
      trending: true
    },
    {
      id: 5,
      name: "Data Science Hub",
      description: "Análisis de datos, machine learning e inteligencia artificial",
      members: 445,
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop",
      isPrivate: false,
      trending: false
    },
    {
      id: 6,
      name: "Freelancers Unidos",
      description: "Red de profesionales independientes y freelancers",
      members: 178,
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200&h=200&fit=crop",
      isPrivate: true,
      trending: true
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "Moderador":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-yellow-100 text-yellow-800";
      case "Moderador":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grupos</h1>
            <p className="text-gray-600">Conecta con comunidades que comparten tus intereses</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Crear Grupo
          </Button>
        </div>

        {/* Búsqueda */}
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar grupos por nombre, descripción o categoría..."
                className="pl-10 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="my-groups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
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
            {myGroups.map((group) => (
              <Card key={group.id} className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                    {/* Imagen del grupo */}
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Información del grupo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{group.name}</h3>
                            {group.isPrivate && (
                              <Badge variant="secondary" className="text-xs">Privado</Badge>
                            )}
                            {getRoleIcon(group.role) && (
                              <div className="flex items-center">
                                {getRoleIcon(group.role)}
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">{group.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {group.members} miembros
                            </div>
                            <span>•</span>
                            <span>{group.posts} posts</span>
                            <span>•</span>
                            <span>{group.lastActivity}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Badge className={getRoleBadgeColor(group.role)}>
                            {group.role}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Ver Grupo
                          </Button>
                          {(group.role === "Admin" || group.role === "Moderador") && (
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {discoverGroups.map((group) => (
                <Card key={group.id} className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
                              {group.trending && (
                                <Badge className="bg-orange-100 text-orange-800 text-xs">Trending</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                              <Users className="h-4 w-4" />
                              <span>{group.members} miembros</span>
                              {group.isPrivate && (
                                <>
                                  <span>•</span>
                                  <Badge variant="secondary" className="text-xs">Privado</Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{group.description}</p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            Unirse
                          </Button>
                          <Button variant="outline" size="sm">
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Categorías Populares */}
            <Card className="shadow-sm border-0 bg-white mt-8">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Categorías Populares</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {["Tecnología", "Marketing", "Diseño", "Negocios", "Freelance", "Startups"].map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      className="text-sm hover:bg-primary hover:text-white transition-colors"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default Groups;

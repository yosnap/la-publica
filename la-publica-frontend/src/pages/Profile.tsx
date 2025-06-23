import { Edit, MapPin, Calendar, Users, Camera, Settings } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const userStats = [
    { label: "Posts", value: "127" },
    { label: "Seguidores", value: "1.2K" },
    { label: "Siguiendo", value: "234" },
    { label: "Grupos", value: "12" }
  ];

  const recentPosts = [
    {
      id: 1,
      content: "Acabamos de lanzar nuestra nueva función de video chat en vivo! 🎥",
      timestamp: "hace 2 días",
      likes: 24,
      comments: 8,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      content: "Compartiendo mi experiencia trabajando remotamente. ¿Cuáles son sus mejores prácticas?",
      timestamp: "hace 1 semana",
      likes: 35,
      comments: 15
    }
  ];

  const userGroups = [
    { name: "Desarrolladores React", members: 234, role: "Admin" },
    { name: "Marketing Digital", members: 156, role: "Miembro" },
    { name: "Emprendedores Tech", members: 89, role: "Moderador" }
  ];

  const achievements = [
    { title: "Miembro Fundador", description: "Uno de los primeros 100 miembros", icon: "🏆" },
    { title: "Contribuidor Activo", description: "50+ posts publicados", icon: "✨" },
    { title: "Connector", description: "Conectó con 100+ miembros", icon: "🤝" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header del Perfil */}
      <Card className="shadow-sm border-0 bg-white overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
          >
            <Camera className="h-4 w-4 mr-2" />
            Cambiar portada
          </Button>
        </div>

        <CardContent className="px-6 pb-6 pt-0 relative">
          {/* Avatar solapando la imagen de portada */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop&crop=face" />
                <AvatarFallback className="text-2xl">JD</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Información del Usuario Centrada */}
          <div className="text-center space-y-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jane Doe</h1>
              <p className="text-gray-600 text-lg">Desarrolladora Full Stack & Community Manager</p>
            </div>
            
            <div className="flex justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Madrid, España
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Se unió en Enero 2023
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-center gap-3 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/editar-perfil')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </div>
          </div>

          {/* Estadísticas en una fila horizontal */}
          <div className="grid grid-cols-4 gap-4 text-center border-t pt-6">
            {userStats.map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contenido con Tabs */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
          <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Posts
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Acerca de
          </TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Grupos
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Logros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {recentPosts.map((post) => (
            <Card key={post.id} className="shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">Jane Doe</span>
                      <span className="text-gray-500 text-sm">{post.timestamp}</span>
                    </div>
                    <p className="text-gray-800 mb-4">{post.content}</p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post content"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span>{post.likes} me gusta</span>
                      <span>{post.comments} comentarios</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
              <h3 className="text-lg font-semibold">Información Personal</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Biografía</h4>
                <p className="text-gray-700">
                  Desarrolladora Full Stack apasionada por crear soluciones innovadoras. 
                  Me encanta compartir conocimiento y ayudar a otros en su crecimiento profesional. 
                  Siempre buscando nuevos retos y oportunidades de aprendizaje.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Habilidades</h4>
                <div className="flex flex-wrap gap-2">
                  {["React", "TypeScript", "Node.js", "Python", "UI/UX", "Project Management"].map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Experiencia</h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Senior Full Stack Developer</p>
                    <p className="text-sm text-gray-600">Tech Solutions Inc. • 2022 - Presente</p>
                  </div>
                  <div>
                    <p className="font-medium">Frontend Developer</p>
                    <p className="text-sm text-gray-600">StartupXYZ • 2020 - 2022</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          {userGroups.map((group, index) => (
            <Card key={index} className="shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.members} miembros</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={group.role === "Admin" ? "default" : "secondary"}
                      className={group.role === "Admin" ? "bg-primary" : ""}
                    >
                      {group.role}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Ver Grupo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <Card key={index} className="shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
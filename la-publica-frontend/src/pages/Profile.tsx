import { Edit, MapPin, Calendar, Users, Camera, Settings, Facebook, Youtube, Twitter } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "@/api/client";
import { getImageUrl } from '@/utils/getImageUrl';
import { fetchPosts, Post as PostType } from "@/api/posts";

const getSocialUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return 'https://' + url;
};

// Definición mínima de tipos para el usuario
interface WorkExperience {
  jobTitle: string;
  company: string;
  startDate?: string;
  endDate?: string;
  isCurrentJob?: boolean;
  description?: string;
}

interface User {
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  gender?: string;
  birthDate?: string;
  createdAt: string;
  role?: string;
  skills?: string[];
  workExperience?: WorkExperience[];
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();

  // Estado para los datos del usuario
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/users/profile');
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          setError('No se pudieron cargar los datos del perfil.');
        }
      } catch (err) {
        setError('Ocurrió un error al cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoadingPosts(true);
    fetchPosts()
      .then((res) => {
        // Filtrar solo los posts del usuario autenticado
        const posts = (res.data || []).filter((p: PostType) => p.author?._id === user._id);
        setUserPosts(posts);
      })
      .finally(() => setLoadingPosts(false));
  }, [user]);

  if (loading) {
    return <div className="text-center py-12">Cargando perfil...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-12">{error}</div>;
  }
  if (!user) {
    return null;
  }

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
        <div
          className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative"
          style={{
            backgroundImage: user.coverPhoto ? `url(${getImageUrl(user.coverPhoto)})` : undefined,
            backgroundSize: user.coverPhoto ? 'cover' : undefined,
            backgroundPosition: user.coverPhoto ? 'center' : undefined,
          }}
        >
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            onClick={() => navigate('/editar-perfil')}
          >
            <Camera className="h-4 w-4 mr-2" />
            Cambiar portada
          </Button>
        </div>

        <CardContent className="px-6 pb-6 pt-0 relative">
          {/* Avatar solapando la imagen de portada */}
          <div className="flex flex-col items-center -mt-16 mb-4">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={getImageUrl(user.profilePicture)} />
                <AvatarFallback className="text-2xl">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              {/* Badge de rol */}
              {user.role && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              )}
            </div>
          </div>

          <div className="text-center space-y-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
              <p className="text-gray-600 text-lg">{user.bio}</p>
            </div>
            {/* Línea con username, calendario y fecha */}
            <div className="flex justify-center items-center gap-x-2 text-sm text-gray-500">
              <span>@{user.username}</span>
              <span>•</span>
              <Calendar className="h-4 w-4 mr-1 inline" />
              <span>
                Se unió en {new Date(user.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }).toLowerCase()}
              </span>
            </div>
            {/* Redes sociales */}
            <div className="flex justify-center gap-4 mt-2">
              {user.socialLinks?.facebook && (
                <a
                  href={getSocialUrl(user.socialLinks.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="group"
                >
                  <span className="flex items-center justify-center rounded-full bg-gray-200 group-hover:bg-[#1877F3] transition-colors w-10 h-10">
                    <Facebook className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                  </span>
                </a>
              )}
              {user.socialLinks?.youtube && (
                <a
                  href={getSocialUrl(user.socialLinks.youtube)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="group"
                >
                  <span className="flex items-center justify-center rounded-full bg-gray-200 group-hover:bg-[#FF0000] transition-colors w-10 h-10">
                    <Youtube className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                  </span>
                </a>
              )}
              {user.socialLinks?.twitter && (
                <a
                  href={getSocialUrl(user.socialLinks.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="group"
                >
                  <span className="flex items-center justify-center rounded-full bg-gray-200 group-hover:bg-[#1DA1F2] transition-colors w-10 h-10">
                    <Twitter className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                  </span>
                </a>
              )}
            </div>
            {/* Aquí puedes dejar los botones y redes sociales como ya tienes */}
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
          {loadingPosts ? (
            <div>Cargando posts...</div>
          ) : userPosts.length === 0 ? (
            <div>No hay publicaciones aún.</div>
          ) : (
            userPosts.map((post) => (
              <Card key={post._id} className="shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      {/* TODO: Mostrar avatar real del usuario */}
                      <AvatarImage src={getImageUrl(user.profilePicture)} />
                      <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">{user.firstName} {user.lastName}</span>
                        <span className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-800 mb-4">
                        {/* TODO: Resaltar menciones y hashtags */}
                        {post.content}
                      </p>
                      {/* TODO: Mostrar likes y comentarios reales */}
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{post.likes.length} me gusta</span>
                        <span>{post.comments.length} comentarios</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          {/* Información Personal */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Información Personal</h3>
              <Button variant="ghost" size="icon" onClick={() => navigate('/editar-perfil')} title="Editar información personal">
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <div className="text-gray-500">Nombre</div>
                <div className="font-medium text-gray-900">{user.firstName}</div>
                <div className="text-gray-500">Apellidos</div>
                <div className="font-medium text-gray-900">{user.lastName}</div>
                <div className="text-gray-500">Nombre de usuario</div>
                <div className="font-medium text-gray-900">{user.username}</div>
                <div className="text-gray-500">Fecha de nacimiento</div>
                <div className="font-medium text-gray-900">
                  {user.birthDate ? new Date(user.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </div>
                <div className="text-gray-500">Género</div>
                <div className="font-medium text-gray-900">
                  {user.gender === 'male' && 'Masculino'}
                  {user.gender === 'female' && 'Femenino'}
                  {user.gender === 'other' && 'Otro'}
                  {user.gender === 'prefer_not_to_say' && 'Prefiero no decirlo'}
                  {!user.gender && '—'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Biografía */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Biografía</h3>
              <Button variant="ghost" size="icon" onClick={() => navigate('/editar-perfil')} title="Editar biografía">
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-line min-h-[48px]">{user.bio || <span className="text-gray-400">Sin biografía</span>}</p>
            </CardContent>
          </Card>

          {/* Habilidades */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Habilidades</h3>
              <Button variant="ghost" size="icon" onClick={() => navigate('/editar-perfil')} title="Editar habilidades">
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  {(user.skills && user.skills.length > 0) ? user.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
                      {skill}
                    </Badge>
                  )) : <span className="text-gray-400">Sin habilidades</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experiencia */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Experiencia</h3>
              <Button variant="ghost" size="icon" onClick={() => navigate('/editar-perfil')} title="Editar experiencia">
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {(user.workExperience && user.workExperience.length > 0) ? user.workExperience.map((exp: WorkExperience, idx: number) => (
                <div key={idx} className="border-b last:border-b-0 pb-3 last:pb-0">
                  <p className="font-medium">{exp.jobTitle}</p>
                  <p className="text-sm text-gray-600">{exp.company} • {exp.startDate ? new Date(exp.startDate).getFullYear() : ''}{exp.endDate ? ` - ${new Date(exp.endDate).getFullYear()}` : exp.isCurrentJob ? ' - Presente' : ''}</p>
                  {exp.description && <p className="text-gray-700 text-sm mt-1">{exp.description}</p>}
                </div>
              )) : <span className="text-gray-400">Sin experiencia laboral</span>}
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
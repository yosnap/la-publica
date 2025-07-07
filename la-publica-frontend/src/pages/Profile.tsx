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
import { fetchUserGroups, Group } from "@/api/groups";

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
  _id: string;
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
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

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

  useEffect(() => {
    const loadUserGroups = async () => {
      try {
        setLoadingGroups(true);
        const response = await fetchUserGroups();
        if (response.success) {
          setUserGroups(response.data);
        }
      } catch (error) {
        console.error('Error loading user groups:', error);
      } finally {
        setLoadingGroups(false);
      }
    };
    loadUserGroups();
  }, []);

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
    { label: "Posts", value: userPosts.length.toString() },
    { label: "Seguidores", value: "1.2K" },
    { label: "Siguiendo", value: "234" },
    { label: "Grupos", value: userGroups.length.toString() }
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


  const achievements = [
    { title: "Miembro Fundador", description: "Uno de los primeros 100 miembros", icon: "🏆" },
    { title: "Contribuidor Activo", description: "50+ posts publicados", icon: "✨" },
    { title: "Connector", description: "Conectó con 100+ miembros", icon: "🤝" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header del Perfil */}
      <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50 overflow-hidden">
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
            className="absolute top-4 right-4 bg-white dark:bg-gray-800/50/20 backdrop-blur-sm text-white hover:bg-white dark:bg-gray-800/50/30"
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">{user.bio}</p>
            </div>
            {/* Línea con username, calendario y fecha */}
            <div className="flex justify-center items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400">
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
                    <Facebook className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
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
                    <Youtube className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
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
                    <Twitter className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
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
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contenido con Tabs */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800/50 border">
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
              <Card key={post._id} className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      {/* TODO: Mostrar avatar real del usuario */}
                      <AvatarImage src={getImageUrl(user.profilePicture)} />
                      <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{new Date(post.createdAt).toLocaleString()}</span>
                      </div>
                      {post.mood && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-sm">{post.mood.emoji}</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">se siente {post.mood.label}</span>
                        </div>
                      )}
                      <div 
                        className="text-gray-800 dark:text-gray-200 mb-4 prose prose-sm max-w-none [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-4 [&_ol]:ml-4 [&_a]:text-blue-500 [&_a]:underline"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                      {/* TODO: Mostrar likes y comentarios reales */}
                      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
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
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Información Personal</h3>
              <Button variant="ghost" size="icon" onClick={() => navigate('/editar-perfil')} title="Editar información personal">
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <div className="text-gray-500 dark:text-gray-400">Nombre</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{user.firstName}</div>
                <div className="text-gray-500 dark:text-gray-400">Apellidos</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{user.lastName}</div>
                <div className="text-gray-500 dark:text-gray-400">Nombre de usuario</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{user.username}</div>
                <div className="text-gray-500 dark:text-gray-400">Fecha de nacimiento</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {user.birthDate ? new Date(user.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Género</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
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
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Biografía</h3>
              <Button variant="ghost" size="icon" onClick={() => navigate('/editar-perfil')} title="Editar biografía">
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-line min-h-[48px]">{user.bio || <span className="text-gray-400">Sin biografía</span>}</p>
            </CardContent>
          </Card>

          {/* Habilidades */}
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
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
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company} • {exp.startDate ? new Date(exp.startDate).getFullYear() : ''}{exp.endDate ? ` - ${new Date(exp.endDate).getFullYear()}` : exp.isCurrentJob ? ' - Presente' : ''}</p>
                  {exp.description && <p className="text-gray-700 text-sm mt-1">{exp.description}</p>}
                </div>
              )) : <span className="text-gray-400">Sin experiencia laboral</span>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          {loadingGroups ? (
            <div className="text-center py-12">Cargando grupos...</div>
          ) : userGroups.length === 0 ? (
            <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tienes grupos aún</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Únete a grupos existentes o crea tu propio grupo para conectar con personas que comparten tus intereses.
                </p>
                <Button onClick={() => navigate('/groups')} className="bg-primary hover:bg-primary/90">
                  Explorar Grupos
                </Button>
              </CardContent>
            </Card>
          ) : (
            userGroups.map((group) => (
              <Card key={group._id} className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {group.image ? (
                          <img src={getImageUrl(group.image)} alt={group.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{group.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{group.memberCount} miembros</p>
                        {group.location && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {group.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={group.userRole === "admin" ? "default" : "secondary"}
                        className={
                          group.userRole === "admin" ? "bg-yellow-100 text-yellow-800" :
                          group.userRole === "moderator" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800 dark:text-gray-200"
                        }
                      >
                        {group.userRole === "admin" ? "Admin" : 
                         group.userRole === "moderator" ? "Moderador" : "Miembro"}
                      </Badge>
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
                </CardContent>
              </Card>
          ))
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <Card key={index} className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
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
import { Edit, MapPin, Calendar, Users, Camera, Settings, Facebook, Youtube, Twitter, Megaphone, MessageSquare, Heart, MessageCircle, Share, MoreHorizontal, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getImageUrl } from '@/utils/getImageUrl';
import { fetchPosts } from "@/api/posts";
import { fetchUserGroups, Group } from "@/api/groups";
import { getUserAnnouncements } from "@/api/announcements";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/hooks/useUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Tipos
interface PostType {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  likes: string[];
  comments: any[];
  createdAt: string;
  image?: string;
}

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
  followers?: string[];
  following?: string[];
}

interface Announcement {
  _id: string;
  type: 'offer' | 'demand';
  title: string;
  description: string;
  category?: {
    _id: string;
    name: string;
  };
  price?: number;
  budget?: {
    min: number;
    max: number;
  };
  location?: string | {
    city: string;
    country: string;
    allowRemote?: boolean;
  };
  active: boolean;
  featured: boolean;
  views: number;
  createdAt: string;
}

const getSocialUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return 'https://' + url;
};

// Función para obtener el badge del rol
const getRoleBadge = (role?: string) => {
  switch (role) {
    case 'admin':
      return {
        text: 'Administrador',
        className: 'bg-red-500 text-white'
      };
    case 'colaborador':
      return {
        text: 'Col·laborador',
        className: 'bg-blue-500 text-white'
      };
    case 'user':
      return {
        text: 'Usuari',
        className: 'bg-green-500 text-white'
      };
    default:
      return {
        text: 'Usuari',
        className: 'bg-gray-500 text-white'
      };
  }
};

const Profile = () => {
  const navigate = useNavigate();

  // Usar el hook centralizado para los datos del usuario
  const { user, loading, error } = useUserProfile();

  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [userAnnouncements, setUserAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

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
        if (response.success && response.data) {
          setUserGroups(response.data);
        }
      } catch (err) {
        console.error('Error loading groups:', err);
      } finally {
        setLoadingGroups(false);
      }
    };
    loadUserGroups();
  }, []);

  // Cargar anuncios del usuario
  useEffect(() => {
    if (!user) return;
    const loadUserAnnouncements = async () => {
      try {
        setLoadingAnnouncements(true);
        const response = await getUserAnnouncements(user._id);
        if (response.success && response.data) {
          setUserAnnouncements(response.data);
        }
      } catch (err) {
        console.error('Error loading announcements:', err);
      } finally {
        setLoadingAnnouncements(false);
      }
    };
    loadUserAnnouncements();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="rounded-xl">
          <CardContent className="p-12">
            <Skeleton className="h-8 w-48 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="rounded-xl">
          <CardContent className="p-12 text-center">
            <p className="text-red-500">{error || 'No se encontró el usuario'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userStats = [
    { label: "Publicacions", value: userPosts.length },
    { label: "Seguidors", value: user.followers?.length || 0 },
    { label: "Seguint", value: user.following?.length || 0 },
    { label: "Grups", value: userGroups.length },
    { label: "Anuncis", value: userAnnouncements.length },
  ];

  // Formatear fecha
  const formatDate = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diff = now.getTime() - posted.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Avui";
    if (days === 1) return "Ahir";
    if (days < 7) return `Fa ${days} dies`;
    if (days < 30) return `Fa ${Math.floor(days / 7)} setmanes`;
    return posted.toLocaleDateString('es-ES');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Tarjeta del Perfil */}
      <Card className="rounded-xl overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gradient-to-r from-blue-400 to-purple-500">
          {user.coverPhoto && (
            <img
              src={getImageUrl(user.coverPhoto)}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => navigate('/editar-perfil')}
          >
            <Camera className="h-4 w-4 mr-2" />
            Editar Portada
          </Button>
        </div>

        <CardContent className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
            <Avatar className="h-32 w-32 border-4 border-white">
              <AvatarImage src={getImageUrl(user.profilePicture)} />
              <AvatarFallback className="text-2xl">{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="pt-16 text-center space-y-3">
            {/* Badge del rol centrado debajo del avatar */}
            <div className="flex justify-center mb-2">
              <Badge className={getRoleBadge(user.role).className}>
                {getRoleBadge(user.role).text}
              </Badge>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">{user.bio}</p>
            </div>
            
            <div className="flex justify-center items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>@{user.username}</span>
              <span>•</span>
              <Calendar className="h-4 w-4 mr-1 inline" />
              <span>
                Es va unir al {new Date(user.createdAt).toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' }).toLowerCase()}
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
            
            <div className="flex justify-center gap-3 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/editar-perfil')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Configuració
              </Button>
            </div>
          </div>
          
          {/* Estadísticas */}
          <div className="grid grid-cols-5 gap-4 text-center border-t pt-6 mt-6">
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
        <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-gray-800/50 border">
          <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Publicacions
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Sobre mi
          </TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Grups
          </TabsTrigger>
          <TabsTrigger value="announcements" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Anuncis
          </TabsTrigger>
          <TabsTrigger value="forums" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Fòrums
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Assoliments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {loadingPosts ? (
            <Card>
              <CardContent className="p-8">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : userPosts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No has publicado ningún post aún</p>
              </CardContent>
            </Card>
          ) : (
            userPosts.map((post) => (
              <Card key={post._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getImageUrl(post.author?.profilePicture)} />
                        <AvatarFallback>{post.author?.firstName?.[0]}{post.author?.lastName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{post.author?.firstName} {post.author?.lastName}</p>
                        <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/posts/${post._id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div 
                    className="text-gray-700 dark:text-gray-300 mb-4 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  
                  {post.image && (
                    <img 
                      src={getImageUrl(post.image)} 
                      alt="Post" 
                      className="rounded-lg w-full mb-4"
                    />
                  )}
                  
                  <div className="flex items-center gap-6 text-gray-500">
                    <button className="flex items-center gap-2 hover:text-red-500">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes.length}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-500">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments.length}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-500">
                      <Share className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Información Personal</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.bio && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Bio</p>
                  <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
                </div>
              )}
              {user.email && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-gray-700 dark:text-gray-300">{user.email}</p>
                </div>
              )}
              {user.gender && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Género</p>
                  <p className="text-gray-700 dark:text-gray-300">{user.gender}</p>
                </div>
              )}
              {user.birthDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fecha de nacimiento</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {new Date(user.birthDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {user.workExperience && user.workExperience.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Experiencia Laboral</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.workExperience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <h4 className="font-semibold">{exp.jobTitle}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {exp.startDate && new Date(exp.startDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}
                        {' - '}
                        {exp.isCurrentJob ? 'Actualidad' : exp.endDate && new Date(exp.endDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}
                      </p>
                      {exp.description && (
                        <p className="mt-2 text-gray-700 dark:text-gray-300">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {user.skills && user.skills.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Habilidades</h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          {loadingGroups ? (
            <Card>
              <CardContent className="p-8">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : userGroups.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No te has unido a ningún grupo aún</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/groups')}
                >
                  Explorar Grupos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userGroups.map((group) => (
                <Card 
                  key={group._id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/groups/${group._id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={getImageUrl(group.image)} />
                        <AvatarFallback>{group.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{group.name}</h4>
                        <p className="text-sm text-gray-500">
                          {group.members?.length || 0} miembros
                        </p>
                      </div>
                    </div>
                    {group.description && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          {user?.role === 'user' && (
            <div className="flex justify-end mb-4">
              <Button onClick={() => navigate('/announcements/new')}>
                <Megaphone className="h-4 w-4 mr-2" />
                Crear Anuncio
              </Button>
            </div>
          )}
          
          {loadingAnnouncements ? (
            <Card>
              <CardContent className="p-8">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : userAnnouncements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No has publicado ningún anuncio aún</p>
                {user?.role === 'user' && (
                  <Button 
                    className="mt-4"
                    onClick={() => navigate('/announcements/new')}
                  >
                    Publicar Anuncio
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            userAnnouncements.map((announcement) => (
              <Card 
                key={announcement._id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/announcements/${announcement._id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {announcement.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={announcement.type === "offer" ? "bg-green-500 text-white" : "bg-blue-500 text-white"}>
                          {announcement.type === "offer" ? (
                            <><TrendingUp className="h-3 w-3 mr-1" /> Oferta</>
                          ) : (
                            <><TrendingDown className="h-3 w-3 mr-1" /> Demanda</>
                          )}
                        </Badge>
                        {announcement.featured && (
                          <Badge className="bg-yellow-500 text-white">Destacado</Badge>
                        )}
                        {!announcement.active && (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/announcements/${announcement._id}/edit`);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {announcement.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{announcement.views} vistas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(announcement.createdAt)}</span>
                      </div>
                      {announcement.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {typeof announcement.location === 'string' 
                              ? announcement.location 
                              : `${announcement.location.city}, ${announcement.location.country}`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {announcement.type === "offer" 
                        ? announcement.price ? `€${announcement.price}` : 'Precio a consultar'
                        : announcement.budget 
                          ? `€${announcement.budget.min} - €${announcement.budget.max}`
                          : 'Presupuesto a definir'
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="forums" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Próximamente: Tus participaciones en foros</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Próximamente: Sistema de logros y reconocimientos</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
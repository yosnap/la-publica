import { Edit, MapPin, Calendar, Users, Camera, Settings, Facebook, Youtube, Twitter, Megaphone, MessageSquare, Heart, MessageCircle, Share, MoreHorizontal, Eye, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getImageUrl } from '@/utils/getImageUrl';
import { fetchPosts, toggleLikePost, commentOnPost, deletePost } from "@/api/posts";
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
import { getUserBySlug } from "@/api/users";
import { FollowingUsersWidget } from "@/components/FollowingUsersWidget";
import { LatestUpdatesWidget } from "@/components/LatestUpdatesWidget";
import { CreatePostInput } from "@/components/CreatePostInput";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  targetUser?: {
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
  slug: string;
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
  location?: string;
  phone?: string;
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

export default function UserProfile() {
  const navigate = useNavigate();
  const { userSlug } = useParams<{ userSlug: string }>();
  const { user: currentUser } = useUserProfile(); // Usuario actual logueado
  
  const [user, setUser] = useState<User | null>(null); // Usuario visitado
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [userAnnouncements, setUserAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  
  // Estados para interacciones con posts
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});
  

  useEffect(() => {
    if (userSlug) {
      loadUserProfile();
    }
  }, [userSlug]);

  const loadUserProfile = async () => {
    if (!userSlug) return;
    
    setLoading(true);
    setError(null);
    try {
      // Cargar datos del usuario visitado
      const userData = await getUserBySlug(userSlug);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('No se pudo cargar el perfil del usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    setLoadingPosts(true);
    fetchPosts()
      .then((res) => {
        // Enhanced debugging with force refresh
        window.DEBUG_POSTS = res.data;
        window.DEBUG_USER_ID = user._id;
        console.clear();
        console.log('=== WALL POSTS DEBUG ===');
        console.log('API Response:', res.data);
        console.log('Profile User ID:', user._id);
        console.log('Total posts from API:', res.data?.length || 0);
        
        // Filtrar posts relacionados con el usuario:
        // 1. Posts que escribió el usuario (en su muro o en muros de otros)
        // 2. Posts que otros escribieron en el muro del usuario
        const posts = (res.data || []).filter((p: PostType) => {
          const isAuthor = p.author?._id === user._id;
          const isTarget = p.targetUser?._id === user._id;
          
          console.log(`🔍 Post ${p._id?.slice(-6)}:`, {
            content: p.content?.slice(0, 50) + '...',
            author: `${p.author?.firstName} ${p.author?.lastName} (${p.author?._id?.slice(-6)})`,
            targetUser: p.targetUser ? `${p.targetUser?.firstName} ${p.targetUser?.lastName} (${p.targetUser?._id?.slice(-6)})` : 'None',
            isAuthor: isAuthor ? '✅' : '❌',
            isTarget: isTarget ? '✅' : '❌',
            WILL_SHOW: (isAuthor || isTarget) ? '🟢 YES' : '🔴 NO'
          });
          
          return isAuthor || isTarget;
        });
        
        console.log('Filtered posts for wall:', posts.length);
        console.log('======================');
        setUserPosts(posts);
        
        // Force a UI update indicator
        document.title = `Profile: ${user.firstName} (${posts.length} posts)`;
      })
      .finally(() => setLoadingPosts(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const loadUserGroups = async () => {
      try {
        setLoadingGroups(true);
        const response = await fetchUserGroups(user._id);
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
  }, [user]);

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

  const refreshPosts = async () => {
    if (!user) return;
    setLoadingPosts(true);
    try {
      const res = await fetchPosts();
      // Debug: Log refresh posts
      console.log('Refreshing posts - All posts from API:', res.data);
      console.log('Current user ID for refresh:', user._id);
      
      // Show all posts related to this user's profile:
      // 1. Posts that the user wrote (on their wall or others' walls)
      // 2. Posts that others wrote on the user's wall
      const posts = (res.data || []).filter((p: PostType) => {
        const isAuthor = p.author?._id === user._id;
        const isTarget = p.targetUser?._id === user._id;
        
        console.log(`Refresh - Post ${p._id}:`, {
          author: p.author?.firstName + ' ' + p.author?.lastName,
          targetUser: p.targetUser?.firstName + ' ' + p.targetUser?.lastName,
          isAuthor,
          isTarget,
          willShow: isAuthor || isTarget
        });
        
        return isAuthor || isTarget;
      });
      setUserPosts(posts);
    } catch (error) {
      console.error('Error refreshing posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Función para manejar likes
  const handleLikePost = async (postId: string) => {
    try {
      const response = await toggleLikePost(postId);
      if (response.success) {
        // Actualizar el post en el estado local
        setUserPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { ...post, likes: response.data.likes }
              : post
          )
        );
      }
    } catch (err) {
      toast.error("Error al dar me gusta");
    }
  };

  // Función para toggle comentarios
  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Función para manejar comentarios
  const handleSubmitComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    
    try {
      const response = await commentOnPost(postId, text);
      if (response.success) {
        // Actualizar el post en el estado local
        setUserPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { ...post, comments: response.data.comments }
              : post
          )
        );
        // Limpiar el campo de comentario
        setCommentText(prev => ({ ...prev, [postId]: "" }));
        toast.success("Comentario agregado");
      }
    } catch (err) {
      toast.error("Error al agregar comentario");
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Función para manejar compartir
  const handleSharePost = async (post: PostType) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${post.author.firstName} ${post.author.lastName}`,
          text: post.content.replace(/<[^>]*>/g, ''), // Remover HTML tags
          url: window.location.href,
        });
      } catch (err) {
        // Usuario canceló o error
      }
    } else {
      // Fallback: copiar al clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Enlace copiado al portapapeles");
      } catch (err) {
        toast.error("Error al compartir");
      }
    }
  };

  // Función para manejar eliminar post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este post?")) {
      return;
    }
    
    try {
      const response = await deletePost(postId);
      if (response.success) {
        // Eliminar el post del estado local
        setUserPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        toast.success("Post eliminado exitosamente");
      }
    } catch (err) {
      toast.error("Error al eliminar el post");
    }
  };

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
            <Button 
              className="mt-4"
              onClick={() => navigate('/miembros')}
            >
              Volver a Miembros
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
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
              {isOwnProfile && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={() => navigate('/editar-perfil')}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Editar Portada
                </Button>
              )}
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
                  {isOwnProfile ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Enviar Mensaje
                      </Button>
                      <Button size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Seguir
                      </Button>
                    </>
                  )}
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
              {/* Post creation input for other users' profiles */}
              {!isOwnProfile && currentUser && (
                <CreatePostInput
                  currentUser={currentUser}
                  targetUser={user}
                  onPostCreated={refreshPosts}
                />
              )}
              
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
                    <p>{isOwnProfile ? 'No has publicado ningún post aún' : 'Este usuario no ha publicado ningún post aún'}</p>
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
                            <p className="font-semibold">
                              {post.author?.firstName} {post.author?.lastName}
                              {post.targetUser && post.targetUser._id !== post.author._id && (
                                <span className="font-normal text-gray-600 dark:text-gray-400">
                                  {' → '}{post.targetUser.firstName} {post.targetUser.lastName}
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                          </div>
                        </div>
                        {(currentUser?._id === post.author._id || currentUser?.role === 'admin') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {currentUser?._id === post.author._id && (
                                <DropdownMenuItem onClick={() => navigate(`/posts/${post._id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeletePost(post._id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
                      
                      <div className="flex items-center space-x-6 pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleLikePost(post._id)}
                          className={`text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg ${
                            post.likes.includes(currentUser?._id) ? 'text-red-600 bg-red-50 dark:bg-gray-700/30' : ''
                          }`}
                        >
                          <Heart className={`h-4 w-4 mr-2 ${post.likes.includes(currentUser?._id) ? 'fill-current' : ''}`} />
                          {post.likes.length > 0 ? post.likes.length : "Me gusta"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleComments(post._id)}
                          className="text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {post.comments.length > 0 ? post.comments.length : "Comentar"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSharePost(post)}
                          className="text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg"
                        >
                          <Share className="h-4 w-4 mr-2" />
                          Compartir
                        </Button>
                      </div>

                      {/* Sección de Comentarios */}
                      {showComments[post._id] && (
                        <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                          {/* Lista de comentarios existentes */}
                          {Array.isArray(post.comments) && post.comments.length > 0 && (
                            <div className="space-y-3 mb-4">
                              {post.comments.map((comment: any) => (
                                <div key={comment._id} className="flex space-x-3">
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={getImageUrl(comment.author?.profilePicture)} />
                                    <AvatarFallback className="text-xs">
                                      {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                        {comment.author?.firstName} {comment.author?.lastName}
                                      </div>
                                      <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                        {comment.text}
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-3">
                                      {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Campo para nuevo comentario */}
                          {currentUser && (
                            <div className="flex space-x-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={getImageUrl(currentUser?.profilePicture)} />
                                <AvatarFallback className="text-xs">
                                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex space-x-2">
                                  <Textarea
                                    placeholder="Escriu un comentari..."
                                    value={commentText[post._id] || ""}
                                    onChange={(e) => setCommentText(prev => ({ 
                                      ...prev, 
                                      [post._id]: e.target.value 
                                    }))}
                                    className="min-h-[40px] py-2 px-3 text-sm resize-none"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmitComment(post._id);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleSubmitComment(post._id)}
                                    disabled={submittingComment[post._id] || !commentText[post._id]?.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                                  >
                                    {submittingComment[post._id] ? "..." : "Enviar"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
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
                    <p>{isOwnProfile ? 'No te has unido a ningún grupo aún' : 'Este usuario no se ha unido a ningún grupo aún'}</p>
                    {isOwnProfile && (
                      <Button 
                        className="mt-4"
                        onClick={() => navigate('/groups')}
                      >
                        Explorar Grupos
                      </Button>
                    )}
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
                            <AvatarFallback>{group.name?.[0] || 'G'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{group.name}</h4>
                            <p className="text-sm text-gray-500">
                              {group.memberCount || 0} miembros
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
                    <p>{isOwnProfile ? 'No has publicado ningún anuncio aún' : 'Este usuario no ha publicado ningún anuncio aún'}</p>
                  </CardContent>
                </Card>
              ) : (
                userAnnouncements.map((announcement) => (
                  <Card key={announcement._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                          <Badge variant={announcement.type === 'offer' ? 'default' : 'secondary'}>
                            {announcement.type === 'offer' ? 'Ofrezco' : 'Busco'}
                          </Badge>
                          {announcement.featured && (
                            <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                              Destacado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Eye className="h-4 w-4" />
                          {announcement.views}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {announcement.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4">
                        {announcement.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          {announcement.price ? `${announcement.price}€` : 'Precio a consultar'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(announcement.createdAt)}
                        </span>
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
                  <p>Actividad en foros próximamente</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Logros y assoliments próximamente</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <FollowingUsersWidget 
            userId={user._id} 
            isOwnProfile={isOwnProfile}
            maxUsers={5}
          />
          <LatestUpdatesWidget />
        </div>
      </div>
    </div>
  );
}
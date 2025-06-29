import { Heart, MessageSquare, Share, MoreHorizontal, Camera, Users, Calendar, User, BookOpen, CheckCircle, Activity, Clock, Play, Building, UserPlus, Settings, XCircle, Edit, Trash, BellOff, Pin, Download, Flag, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "@/components/ui/circular-progress";
import { SemiCircularProgress } from "@/components/ui/semi-circular-progress";
import { useEffect, useState } from "react";
import apiClient from "@/api/client";
import { getImageUrl } from '@/utils/getImageUrl';
import { fetchUserFeed, createPost, updatePost } from "@/api/posts";
import { Skeleton } from "@/components/ui/skeleton";
import { Paperclip, Image as ImageIcon, Smile, BarChart2, Globe, Lock, Users as UsersIcon } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

// Post type for dashboard feed
export interface Post {
  _id: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    // Add more fields if needed
  };
  content: string;
  likes: string[];
  comments: Array<{
    _id: string;
    author: {
      _id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  image?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [creatingPost, setCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [privacy, setPrivacy] = useState("public"); // Simulado
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/users/profile');
        if (response.data.success) {
          setUser(response.data.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Calcular progreso de perfil
  const profileFields = [
    user?.firstName,
    user?.lastName,
    user?.email,
    user?.profilePicture,
    user?.bio,
    user?.skills?.length,
    user?.workExperience?.length,
    user?.socialLinks?.facebook,
    user?.socialLinks?.twitter,
    user?.socialLinks?.youtube,
    user?.birthDate,
    user?.gender,
    user?.phone,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const totalFields = profileFields.length;
  const profileProgress = Math.round((completedFields / totalFields) * 100);

  const activities = [
    {
      id: 1,
      user: {
        name: "John",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        username: "@john"
      },
      type: "job",
      content: "This is new job",
      timestamp: "2 hours ago",
      likes: 0,
      comments: 0,
      jobTitle: "View Job"
    },
    {
      id: 2,
      user: {
        name: "John",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        username: "@john"
      },
      type: "post",
      content: "John posted an update",
      timestamp: "2 years ago",
      likes: 0,
      comments: 0,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
      hasVideo: true
    }
  ];

  const blogPosts = [
    { 
      title: "Tackle Your closet Spring cleaning", 
      date: "May 14, 2019", 
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=100&fit=crop",
      category: "lifestyle"
    },
    { 
      title: "The Truth About Business Blogging", 
      date: "May 14, 2019", 
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      category: "business"
    },
    { 
      title: "10 Tips to stay healthy when...", 
      date: "May 14, 2019", 
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
      category: "health"
    },
    { 
      title: "Visiting Amsterdam on a Budget", 
      date: "May 8, 2019", 
      image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=100&h=100&fit=crop",
      category: "travel"
    },
    { 
      title: "OMA completes renovation of Sotheby's New...", 
      date: "May 8, 2019", 
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      category: "architecture"
    }
  ];

  const myGroups = [
    { 
      name: "Desarrolladores React", 
      members: 234, 
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=60&h=60&fit=crop",
      isPrivate: false 
    },
    { 
      name: "Marketing Digital", 
      members: 156, 
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=60&h=60&fit=crop",
      isPrivate: true 
    },
    { 
      name: "Emprendedores Tech", 
      members: 89, 
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=60&h=60&fit=crop",
      isPrivate: false 
    }
  ];

  const companies = [
    { 
      name: "Google Inc.", 
      employees: "100k+", 
      logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=60&h=60&fit=crop",
      industry: "Technology" 
    },
    { 
      name: "Microsoft Corp.", 
      employees: "200k+", 
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=60&h=60&fit=crop",
      industry: "Software" 
    },
    { 
      name: "Tesla Inc.", 
      employees: "50k+", 
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop",
      industry: "Automotive" 
    }
  ];

  const collaborators = [
    { 
      name: "Alice Johnson", 
      role: "Frontend Developer", 
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
      status: "online" 
    },
    { 
      name: "Bob Smith", 
      role: "UX Designer", 
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face",
      status: "offline" 
    },
    { 
      name: "Carol Davis", 
      role: "Product Manager", 
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
      status: "online" 
    }
  ];

  const followingUsers = [
    { name: "Alice", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" },
    { name: "Bob", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face" },
    { name: "Carol", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" },
    { name: "David", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" },
    { name: "Eve", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=40&h=40&fit=crop&crop=face" },
    { name: "Frank", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" },
    { name: "Grace", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face" },
    { name: "Henry", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face" },
    { name: "Ivy", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=face" },
    { name: "Jack", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face" }
  ];

  const latestUpdates = [
    {
      user: {
        name: "John",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      },
      action: "posted an update",
      time: "3 years ago"
    },
    {
      user: {
        name: "Adele",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
      },
      action: "posted an update",
      time: "3 years ago"
    },
    {
      user: {
        name: "John",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      },
      action: "posted an update",
      time: "4 years ago"
    },
    {
      user: {
        name: "John",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      },
      action: "posted an update in the group",
      group: "Coffee Addicts",
      time: "4 years ago"
    },
    {
      user: {
        name: "John",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      },
      action: "posted an update",
      time: "4 years ago"
    }
  ];

  // Steps for profile completion (con subcampos)
  const profileSteps = [
    {
      label: "Información general",
      complete: Boolean(user?.firstName && user?.lastName && user?.email && user?.bio && user?.gender && user?.birthDate),
      total: 6,
      done: [user?.firstName, user?.lastName, user?.email, user?.bio, user?.gender, user?.birthDate].filter(Boolean).length,
    },
    {
      label: "Experiencia laboral",
      complete: Boolean(user?.workExperience && user?.workExperience.length > 0),
      total: 3,
      done: user?.workExperience ? Math.min(user?.workExperience.length, 3) : 0,
    },
    {
      label: "Foto de perfil",
      complete: Boolean(user?.profilePicture),
      total: 1,
      done: user?.profilePicture ? 1 : 0,
    },
    {
      label: "Foto de portada",
      complete: Boolean(user?.coverPhoto),
      total: 1,
      done: user?.coverPhoto ? 1 : 0,
    },
    {
      label: "Redes sociales",
      complete: Boolean(user?.socialLinks && (user?.socialLinks.facebook || user?.socialLinks.twitter || user?.socialLinks.youtube)),
      total: 1,
      done: user?.socialLinks && (user?.socialLinks.facebook || user?.socialLinks.twitter || user?.socialLinks.youtube) ? 1 : 0,
    },
  ];
  const stepsCompleted = profileSteps.filter(s => s.complete).length;
  const stepsTotal = profileSteps.length;
  const percent = Math.round((stepsCompleted / stepsTotal) * 100);

  // Fetch posts on mount
  useEffect(() => {
    setLoadingPosts(true);
    fetchUserFeed()
      .then((res) => {
        setPosts(res.data || []);
      })
      .finally(() => setLoadingPosts(false));
  }, []);

  // Handle post creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    setCreatingPost(true);
    try {
      // TODO: Detect mentions, hashtags, categories, scheduling
      await createPost(postContent);
      setPostContent("");
      // Refresh posts after creation
      setLoadingPosts(true);
      const res = await fetchUserFeed();
      setPosts(res.data || []);
    } catch (err) {
      // TODO: Show error toast
    } finally {
      setCreatingPost(false);
      setLoadingPosts(false);
    }
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    setNewPostContent("");
  };

  const handleCreatePostModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setPosting(true);
    try {
      await createPost(newPostContent);
      setNewPostContent("");
      setModalOpen(false);
      setLoadingPosts(true);
      const res = await fetchUserFeed();
      setPosts(res.data || []);
    } catch (err) {
      // TODO: Mostrar error
    } finally {
      setPosting(false);
      setLoadingPosts(false);
    }
  };

  // Función para eliminar post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar este post?")) return;
    try {
      // Aquí deberías llamar a la API para eliminar el post
      // await deletePost(postId);
      setPosts(posts.filter(p => p._id !== postId));
      toast.success("Post eliminado correctamente");
    } catch (err) {
      toast.error("Error al eliminar el post");
    }
  };

  // Función para abrir modal de edición
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setEditModalOpen(true);
  };

  // Función para guardar edición
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editContent.trim()) return;
    setSavingEdit(true);
    try {
      // Llamar a la API para actualizar el post
      const updated = await updatePost(editingPost._id, editContent);
      setPosts(posts.map(p => p._id === editingPost._id ? { ...p, ...updated.data } : p));
      toast.success("Post editado correctamente");
      setEditModalOpen(false);
      setEditingPost(null);
      setEditContent("");
    } catch (err) {
      toast.error("Error al editar el post");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda - Widgets */}
          <div className="lg:col-span-3 space-y-6">
            {/* Mis Grupos Widget */}
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Mis Grupos
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-blue-600">
                    Ver todos
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myGroups.map((group, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{group.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{group.members} miembros</span>
                        {group.isPrivate && (
                          <Badge variant="secondary" className="text-xs">Privado</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Blog Widget */}
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-orange-500" />
                  Blog
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {blogPosts.slice(0, 4).map((post, index) => (
                  <div key={index} className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-gray-600 mt-4 hover:bg-gray-100">
                  VER TODOS
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Columna Central - Activity Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Activity Feed</h1>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="cursor-pointer hover:text-gray-900">Mostrar todo</span>
                <span>·</span>
                <span className="cursor-pointer hover:text-gray-900">por nuevos posts</span>
              </div>
            </div>

            {/* Crear Post (área en el feed) */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Card className="bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow mb-4">
                  <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                      <AvatarImage src={getImageUrl(user?.profilePicture)} />
                      <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                      <input
                        className="w-full bg-gray-100 rounded-full px-4 py-2 text-gray-500 cursor-pointer outline-none"
                        placeholder={`¿Qué estás pensando, ${user?.firstName}?`}
                        readOnly
                        onClick={handleOpenModal}
                      />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear una publicación</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePostModal} className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getImageUrl(user?.profilePicture)} />
                      <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</div>
                      {/* Selector de privacidad simulado */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 mt-1 cursor-pointer">
                        {privacy === "public" ? <Globe className="h-4 w-4 mr-1" /> : privacy === "friends" ? <UsersIcon className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
                        {privacy === "public" ? "Público" : privacy === "friends" ? "Solo amigos" : "Privado"}
                      </div>
                    </div>
                  </div>
                  <RichTextEditor
                    value={newPostContent}
                    onChange={setNewPostContent}
                    placeholder={`Comparte algo con la comunidad, ${user?.firstName}...`}
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="icon" disabled title="Adjuntar imagen">
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" disabled title="Adjuntar archivo">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" disabled title="Agregar GIF">
                        <Smile className="h-5 w-5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" disabled title="Encuesta">
                        <BarChart2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button type="submit" disabled={posting || !newPostContent || newPostContent === '<p><br></p>'} className="bg-[#4F8FF7] text-white">
                      {posting ? "Publicando..." : "Publicar"}
                    </Button>
                </div>
                </form>
                <DialogClose asChild>
                  <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-700" aria-label="Cerrar">
                    ×
                  </button>
                </DialogClose>
              </DialogContent>
            </Dialog>

            {/* Feed de Actividades */}
            <div className="space-y-6">
              {loadingPosts ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-32 w-full rounded-lg" />
                    </CardContent>
                  </Card>
                ))
              ) : posts.length === 0 ? (
                <div className="text-center text-gray-400">No hay publicaciones aún.</div>
              ) : (
                posts.map((post) => (
                  <Card key={post._id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getImageUrl(post.author?.profilePicture)} />
                          <AvatarFallback>{post.author?.firstName?.[0]}{post.author?.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 truncate">{post.author?.firstName} {post.author?.lastName}</span>
                            <span className="text-xs text-gray-400">· {new Date(post.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      {/* Menú de opciones */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Si es el autor */}
                          {user?._id === post.author._id && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditPost(post)}>
                                <Edit className="h-4 w-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeletePost(post._id)}>
                                <Trash className="h-4 w-4 mr-2" /> Eliminar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem disabled>
                                <MessageSquare className="h-4 w-4 mr-2" /> Desactivar comentarios
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Pin className="h-4 w-4 mr-2" /> Fijar en el feed
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Download className="h-4 w-4 mr-2" /> Descargar archivos
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <BellOff className="h-4 w-4 mr-2" /> Apagar notificaciones
                              </DropdownMenuItem>
                            </>
                          )}
                          {/* Si es admin y no es el autor */}
                          {user?.role === 'admin' && user._id !== post.author._id && (
                            <>
                              <DropdownMenuItem onClick={() => handleDeletePost(post._id)}>
                                <Trash className="h-4 w-4 mr-2" /> Eliminar (admin)
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Pin className="h-4 w-4 mr-2" /> Fijar en el feed
                              </DropdownMenuItem>
                            </>
                          )}
                          {/* Si NO es el autor */}
                          {user?._id !== post.author._id && user?.role !== 'admin' && (
                            <>
                              <DropdownMenuItem disabled>
                                <Flag className="h-4 w-4 mr-2" /> Reportar
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Bell className="h-4 w-4 mr-2" /> Apagar/encender notificaciones
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </CardHeader>
                  <CardContent className="pt-0">
                      <div className="mb-2 text-gray-900 text-base whitespace-pre-line">{post.content}</div>
                      {/* Imagen si existe */}
                      {post.image && (
                        <div className="mb-4">
                          <img src={post.image} alt="Imagen del post" className="w-full h-64 object-cover rounded-lg" />
                      </div>
                    )}
                    <div className="flex items-center space-x-6 pt-2">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Heart className="h-4 w-4 mr-2" />
                          {post.likes.length > 0 ? post.likes.length : "Me gusta"}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <MessageSquare className="h-4 w-4 mr-2" />
                          {post.comments.length > 0 ? post.comments.length : "Comentar"}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Share className="h-4 w-4 mr-2" />
                          Compartir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </div>

          {/* Columna Derecha - Widgets */}
          <div className="lg:col-span-3 space-y-6">
            {/* Widget Completa tu Perfil */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-base font-semibold">Completa tu Perfil</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="relative flex flex-col items-center w-full">
                  <SemiCircularProgress value={percent} size={180} strokeWidth={14} color="#2563eb">
                    <span className="text-sm text-gray-400 font-medium">Completado</span>
                  </SemiCircularProgress>
                </div>
                <ul className="w-full flex flex-col gap-0 relative pl-2 pr-4 mb-2 mt-2">
                  {profileSteps.map((step, idx) => (
                    <li key={idx} className="flex items-center gap-3 min-h-[28px] relative">
                      {/* Stepper vertical line */}
                      {idx < profileSteps.length - 1 && (
                        <span className="absolute left-2 top-6 w-px h-[24px] bg-gray-200 z-0" />
                      )}
                      {/* Step icon */}
                      <span className="relative z-10 flex items-center justify-center h-5 w-5">
                        {step.complete ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="9" stroke="#2563eb" strokeWidth="2" fill="none" />
                            <path d="M6 10.5L9 13.5L14 8.5" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="9" stroke="#d1d5db" strokeWidth="2" fill="none" />
                          </svg>
                        )}
                      </span>
                      {/* Step label and count */}
                      <span className={
                        step.complete
                          ? "font-semibold text-[#2563eb] flex-1 text-base"
                          : "text-gray-400 flex-1 text-base"
                      }>
                        {step.label}
                      </span>
                      <span className={step.complete ? "font-semibold text-[#2563eb] text-xs" : "text-gray-400 text-xs"}>
                        {step.done}/{step.total}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/editar-perfil'}>
                  Completar Perfil
                </Button>
              </CardContent>
            </Card>
            {/* Empresas Widget */}
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-purple-500" />
                    Empresas
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-purple-600">
                    Ver todas
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {companies.map((company, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{company.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{company.employees} empleados</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{company.industry}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3 border-purple-200 text-purple-600 hover:bg-purple-50">
                  <Building className="h-4 w-4 mr-2" />
                  Explorar Empresas
                </Button>
              </CardContent>
            </Card>
            {/* Colaboradores Widget */}
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-green-500" />
                    Colaboradores
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-green-600">
                    Ver todos
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collaborators.map((collaborator, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{collaborator.name}</p>
                      <p className="text-xs text-gray-500 truncate">{collaborator.role}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3 border-green-200 text-green-600 hover:bg-green-50">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invitar Colaboradores
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Modal de edición de post */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar publicación</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getImageUrl(user?.profilePicture)} />
                <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</div>
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 mt-1">
                  Editando publicación
                </div>
              </div>
            </div>
            <RichTextEditor
              value={editContent}
              onChange={setEditContent}
              placeholder="Edita tu publicación..."
              className="mb-2"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="icon" disabled title="Adjuntar imagen">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" disabled title="Adjuntar archivo">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" disabled title="Agregar GIF">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" disabled title="Encuesta">
                  <BarChart2 className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} disabled={savingEdit}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingEdit || !editContent || editContent === '<p><br></p>'} className="bg-[#4F8FF7] text-white">
                  {savingEdit ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

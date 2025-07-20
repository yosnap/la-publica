import { Heart, MessageSquare, Share, MoreHorizontal, Camera, Calendar, User, CheckCircle, Circle, Activity, Clock, Play, Building, UserPlus, Settings, XCircle, Edit, Trash, BellOff, Pin, Download, Flag, Bell, Briefcase, Award } from "lucide-react";
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
import { getImageUrl } from '@/utils/getImageUrl';
import { fetchUserFeed, createPost, updatePost, toggleLikePost, commentOnPost, togglePostComments, togglePostPin } from "@/api/posts";
import { useUserProfile } from "@/hooks/useUser";
import { getCompanies } from "@/api/companies";
import { fetchAllUsers } from "@/api/users";
import { getJobOffers } from "@/api/jobOffers";
import { getAdvisories } from "@/api/advisories";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api/client";
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
import { GroupsWidget } from "@/components/GroupsWidget";
import { AnnouncementsWidget } from "@/components/AnnouncementsWidget";
import { ForumsWidget } from "@/components/ForumsWidget";
import { BlogsWidget } from "@/components/BlogsWidget";
import { FollowingUsersWidget } from "@/components/FollowingUsersWidget";

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
  mood?: {
    emoji: string;
    label: string;
  };
  commentsDisabled: boolean;
  pinned: boolean;
  pinnedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  pinnedAt?: string;
}

const Dashboard = () => {
  // Usar el hook centralizado para los datos del usuario
  const { user, loading } = useUserProfile();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [creatingPost, setCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [privacy, setPrivacy] = useState("public");  // Simulado
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Estados para datos reales
  const [companies, setCompanies] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [jobOffers, setJobOffers] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [loadingWidgets, setLoadingWidgets] = useState(true);
  
  const navigate = useNavigate();
  
   // Estados para herramientas de posts
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPollOptions, setShowPollOptions] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDuration, setPollDuration] = useState("1d");
  const [selectedMood, setSelectedMood] = useState<{emoji: string, label: string} | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

   // Lógica de progreso de perfil
  const profileSteps = [
    {
      label: "Informació general",
      complete: [user?.firstName, user?.lastName, user?.email, user?.bio, user?.gender, user?.birthDate].filter(Boolean).length >= 5,
      total: 6,
      done: [user?.firstName, user?.lastName, user?.email, user?.bio, user?.gender, user?.birthDate].filter(Boolean).length,
    },
    {
      label: "Experiència laboral",
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
      label: "Xarxes socials",
      complete: Boolean(user?.socialLinks && (user?.socialLinks.facebook || user?.socialLinks.twitter || user?.socialLinks.youtube)),
      total: 1,
      done: user?.socialLinks && (user?.socialLinks.facebook || user?.socialLinks.twitter || user?.socialLinks.youtube) ? 1 : 0,
    },
  ];
  const stepsCompleted = profileSteps.filter(s => s.complete).length;
  const stepsTotal = profileSteps.length;
  const percent = Math.round((stepsCompleted / stepsTotal) * 100);
  
   // Debug removido - ya no es necesario

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

  // Funciones para cargar datos reales
  const loadWidgetData = async () => {
    try {
      setLoadingWidgets(true);
      
      // Cargar datos en paralelo
      const [companiesRes, usersRes, jobOffersRes, advisoriesRes] = await Promise.all([
        getCompanies({ limit: 4, verified: true }).catch(() => ({ data: [] })),
        fetchAllUsers({ sortBy: 'active', limit: 4 }).catch(() => ({ data: [] })),
        getJobOffers({ limit: 4 }).catch(() => ({ data: [] })),
        getAdvisories({ limit: 4 }).catch(() => ({ data: [] }))
      ]);
      
      // Asegurar que los datos son arrays válidos
      setCompanies(Array.isArray(companiesRes.data) ? companiesRes.data.slice(0, 4) : []);
      setCollaborators(Array.isArray(usersRes.data) ? usersRes.data.filter((u: any) => u.role === 'colaborador').slice(0, 4) : []);
      setJobOffers(Array.isArray(jobOffersRes.data) ? jobOffersRes.data.slice(0, 4) : []);
      setAdvisories(Array.isArray(advisoriesRes.data) ? advisoriesRes.data.slice(0, 4) : []);
      
    } catch (error) {
      console.error('Error loading widget data:', error);
    } finally {
      setLoadingWidgets(false);
    }
  };




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


   // Fetch posts on mount
  useEffect(() => {
    // Cargar posts y datos de widgets
    setLoadingPosts(true);
    fetchUserFeed(1, 20) // Cargar 20 posts inicialmente
      .then((res) => {
        setPosts(res.data || []);
        setHasMorePosts((res.data || []).length === 20);
      })
      .finally(() => setLoadingPosts(false));
    
    // Cargar datos de widgets
    loadWidgetData();
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
       // Refresh posts after creation - volver a cargar desde el principio
      setLoadingPosts(true);
      setCurrentPage(1);
      const res = await fetchUserFeed(1, 20);
      setPosts(res.data || []);
      setHasMorePosts((res.data || []).length === 20);
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
      let imageUrl = null;
      
       // Subir imagen si existe
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const uploadResponse = await apiClient.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadResponse.data.imageUrl;
      }

       // Crear el post con contenido e imagen
      const postData = {
        content: newPostContent,
        ...(imageUrl && { image: imageUrl }),
        ...(selectedMood && { mood: selectedMood }),
        ...(showPollOptions && pollOptions.some(opt => opt.trim()) && {
          poll: {
            options: pollOptions.filter(opt => opt.trim()),
            duration: pollDuration
          }
        })
      };

      console.log('Sending mood:', selectedMood);  // Debug
      await createPost(postData.content, imageUrl, selectedMood);
      
      clearPostForm();
      setModalOpen(false);
      toast.success("Post publicado exitosamente");
      
       // Refresh posts after creation - volver a cargar desde el principio
      setLoadingPosts(true);
      setCurrentPage(1);
      const res = await fetchUserFeed(1, 20);
      setPosts(res.data || []);
      setHasMorePosts((res.data || []).length === 20);
    } catch (err) {
      toast.error("Error al publicar el post");
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

   // Función para manejar likes
  const handleLikePost = async (postId: string) => {
    try {
      const response = await toggleLikePost(postId);
      if (response.success) {
         // Actualizar el post en el estado local
        setPosts(prevPosts => 
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
        setPosts(prevPosts => 
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
  const handleSharePost = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${post.author.firstName} ${post.author.lastName}`,
          text: post.content.replace( /<[^>]*>/g, ''), // Remover HTML tags
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

   // Función para manejar selección de imagen
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {  // 5MB limit
        toast.error("La imagen no puede ser mayor a 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

   // Función para remover imagen seleccionada
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

   // Función para manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {  // 10MB limit
        toast.error("El archivo no puede ser mayor a 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

   // Función para remover archivo seleccionado
  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

   // Función para agregar opción de encuesta
  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

   // Función para remover opción de encuesta
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

   // Función para actualizar opción de encuesta
  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

   // Función para toggle encuesta
  const togglePoll = () => {
    setShowPollOptions(!showPollOptions);
    if (!showPollOptions) {
      setPollOptions(["", ""]);
    }
  };

   // Función para insertar mención
  const insertMention = () => {
    setNewPostContent(prev => prev + '@');
  };

   // Función para seleccionar mood/estado
  const selectMood = (mood: {emoji: string, label: string}) => {
    setSelectedMood(mood);
    setShowMoodPicker(false);
  };

   // Función para remover mood seleccionado
  const removeMood = () => {
    setSelectedMood(null);
  };

   // Función para limpiar formulario de post
  const clearPostForm = () => {
    setNewPostContent("");
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedFile(null);
    setShowPollOptions(false);
    setPollOptions(["", ""]);
    setSelectedMood(null);
    setShowMoodPicker(false);
  };

   // Función para desactivar/activar comentarios
  const handleToggleComments = async (postId: string) => {
    try {
      const response = await togglePostComments(postId);
      if (response.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { ...post, commentsDisabled: response.data.commentsDisabled }
              : post
          )
        );
        toast.success(response.message);
      }
    } catch (err) {
      toast.error("Error al cambiar estado de comentarios");
    }
  };

   // Función para fijar/desfijar post
  const handleTogglePin = async (postId: string) => {
    try {
      const response = await togglePostPin(postId);
      if (response.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { 
                  ...post, 
                  pinned: response.data.pinned,
                  pinnedBy: response.data.pinnedBy,
                  pinnedAt: response.data.pinnedAt
                }
              : post
          )
        );
        toast.success(response.message);
        
         // Reordenar posts para mostrar fijados al principio
        if (response.data.pinned) {
          setPosts(prevPosts => {
            const updatedPost = prevPosts.find(p => p._id === postId);
            const otherPosts = prevPosts.filter(p => p._id !== postId);
            return updatedPost ? [{ ...updatedPost, pinned: true, pinnedBy: response.data.pinnedBy, pinnedAt: response.data.pinnedAt }, ...otherPosts] : prevPosts;
          });
        }
      }
    } catch (err) {
      toast.error("Error al fijar/desfijar post");
    }
  };

   // Función para verificar si el usuario es admin o moderador
  const isAdminOrModerator = () => {
    return user?.role === 'admin' || user?.role === 'moderator';
  };

   // Función para cargar más posts
  const loadMorePosts = async () => {
    if (!hasMorePosts || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await fetchUserFeed(nextPage, 20);
      const newPosts = res.data || [];
      
      if (newPosts.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
        setCurrentPage(nextPage);
        setHasMorePosts(newPosts.length === 20);
      } else {
        setHasMorePosts(false);
      }
    } catch (err) {
      toast.error("Error al cargar más posts");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          { /* Columna Izquierda - Widgets */}
          <div className="lg:col-span-3 space-y-6">
            <FollowingUsersWidget />
            <GroupsWidget />
            <AnnouncementsWidget />
            <ForumsWidget />
            <BlogsWidget />
          </div>

          { /* Columna Central - Activity Feed */}
          <div className="lg:col-span-6 space-y-6">
            { /* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Activitat</h1>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="cursor-pointer hover:text-gray-900 dark:text-gray-100">Mostrar todo</span>
                <span>·</span>
                <span className="cursor-pointer hover:text-gray-900 dark:text-gray-100">por nuevos posts</span>
              </div>
            </div>

            { /* Crear Post (área en el feed) */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition-shadow mb-4">
                  <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                      <AvatarImage src={getImageUrl(user?.profilePicture)} />
                      <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                      <input
                        className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full px-4 py-2 text-gray-500 dark:text-gray-400 cursor-pointer outline-none"
                        placeholder={`Què estàs pensant, ${user?.firstName}?`}
                        readOnly
                        onClick={handleOpenModal}
                      />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-gray-100">Crear una publicación</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePostModal} className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getImageUrl(user?.profilePicture)} />
                      <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {user?.firstName} {user?.lastName}
                        {selectedMood && (
                          <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                            se siente {selectedMood.emoji} {selectedMood.label}
                          </span>
                        )}
                      </div>
                      { /* Selector de privacidad */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded px-2 py-1 mt-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                            {privacy === "public" ? <Globe className="h-4 w-4 mr-1"  /> : privacy === "friends" ? <UsersIcon className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
                            {privacy === "public" ? "Público" : privacy === "friends" ? "Solo amigos" : "Privado"}
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <DropdownMenuItem onClick={() => setPrivacy("public")} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Globe className="h-4 w-4 mr-2" />
                            Público
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPrivacy("friends")} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <UsersIcon className="h-4 w-4 mr-2" />
                            Solo amigos
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPrivacy("private")} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Lock className="h-4 w-4 mr-2" />
                            Privado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <RichTextEditor
                    value={newPostContent}
                    onChange={setNewPostContent}
                    placeholder={`Comparteix alguna cosa amb la comunitat, ${user?.firstName}...`}
                    className="mb-2"
                  />
                  
                  { /* Preview de imagen seleccionada */}
                  {imagePreview && (
                    <div className="relative mt-4">
                      <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeSelectedImage}
                      >
                        ✕
                      </Button>
                    </div>
                  )}

                  { /* Preview de archivo seleccionado */}
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm">{selectedFile.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeSelectedFile}
                      >
                        ✕
                      </Button>
                    </div>
                  )}

                  { /* Opciones de encuesta */}
                  {showPollOptions && (
                    <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Opciones de encuesta</span>
                        <Button type="button" variant="ghost" size="sm" onClick={togglePoll}>✕</Button>
                      </div>
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Opció ${index + 1}`}
                            value={option}
                            onChange={(e) => updatePollOption(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                          {pollOptions.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePollOption(index)}
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 4 && (
                        <Button type="button" variant="outline" size="sm" onClick={addPollOption}>
                          + Agregar opción
                        </Button>
                      )}
                    </div>
                  )}

                  { /* Mood/Estado seleccionado */}
                  {selectedMood && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedMood.emoji}</span>
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">se siente {selectedMood.label}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeMood}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        ✕
                      </Button>
                    </div>
                  )}

                  { /* Selector de mood/estado */}
                  {showMoodPicker && (
                    <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-gray-100">¿Cómo te sientes?</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowMoodPicker(false)}>✕</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {emoji: '😊', label: 'feliz'},
                          {emoji: '😍', label: 'enamorado'},
                          {emoji: '🤔', label: 'pensativo'},
                          {emoji: '😎', label: 'genial'},
                          {emoji: '🎉', label: 'emocionado'},
                          {emoji: '😴', label: 'cansado'},
                          {emoji: '🔥', label: 'motivado'},
                          {emoji: '😂', label: 'divertido'},
                          {emoji: '💪', label: 'fuerte'},
                          {emoji: '🌟', label: 'brillante'},
                          {emoji: '😌', label: 'relajado'},
                          {emoji: '🚀', label: 'productivo'}
                        ].map((mood) => (
                          <button
                            key={mood.label}
                            type="button"
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-left"
                            onClick={() => selectMood(mood)}
                          >
                            <span className="text-lg">{mood.emoji}</span>
                            <span className="text-sm">{mood.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2">
                      { /* Input oculto para imagen */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => document.getElementById('image-upload')?.click()}
                        title="Adjuntar imagen"
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 /30 ${selectedImage ? "text-blue-600 bg-blue-50 dark:bg-gray-700/50" : "text-gray-600 dark:text-gray-400"}`}
                      >
                        <ImageIcon className="h-5 w-5" />
                      </Button>

                      { /* Input oculto para archivo */}
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => document.getElementById('file-upload')?.click()}
                        title="Adjuntar archivo"
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 /30 ${selectedFile ? "text-blue-600 bg-blue-50 dark:bg-gray-700/50" : "text-gray-600 dark:text-gray-400"}`}
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>

                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setShowMoodPicker(!showMoodPicker)}
                        title="Agregar estado de ánimo"
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 /30 ${showMoodPicker || selectedMood ? "text-blue-600 bg-blue-50 dark:bg-gray-700/50" : "text-gray-600 dark:text-gray-400"}`}
                      >
                        <Smile className="h-5 w-5" />
                      </Button>

                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={togglePoll}
                        title="Crear encuesta"
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 /30 ${showPollOptions ? "text-blue-600 bg-blue-50 dark:bg-gray-700/50" : "text-gray-600 dark:text-gray-400"}`}
                      >
                        <BarChart2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={posting || (!newPostContent.trim() && !selectedImage && !selectedFile)}
                      className="bg-[#4F8FF7] text-white"
                    >
                      {posting ? "Publicando..." : "Publicar"}
                    </Button>
                </div>
                </form>
              </DialogContent>
            </Dialog>

            { /* Feed de Actividades */}
            <div className="space-y-6">
              {loadingPosts ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
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
                  <Card key={post._id} className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getImageUrl(post.author?.profilePicture)} />
                          <AvatarFallback>{post.author?.firstName?.[0]}{post.author?.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{post.author?.firstName} {post.author?.lastName}</span>
                            <span className="text-xs text-gray-400">· {new Date(post.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          {post.mood && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-sm">{post.mood.emoji}</span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">se siente {post.mood.label}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      { /* Menú de opciones */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          { /* Si es el autor */}
                          {user?._id && post.author && user._id === post.author._id && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditPost(post)}>
                                <Edit className="h-4 w-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeletePost(post._id)}>
                                <Trash className="h-4 w-4 mr-2" /> Eliminar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {isAdminOrModerator() && (
                                <>
                                  <DropdownMenuItem onClick={() => handleToggleComments(post._id)}>
                                    <MessageSquare className="h-4 w-4 mr-2" /> 
                                    {post.commentsDisabled ? "Activar comentarios" : "Desactivar comentarios"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleTogglePin(post._id)}>
                                    <Pin className="h-4 w-4 mr-2" /> 
                                    {post.pinned ? "Desfijar del feed" : "Fijar en el feed"}
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem disabled>
                                <Download className="h-4 w-4 mr-2" /> Descargar archivos
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <BellOff className="h-4 w-4 mr-2" /> Apagar notificaciones
                              </DropdownMenuItem>
                            </>
                          )}
                          { /* Si es admin y no es el autor */}
                          {user?.role === 'admin' && post.author && user._id !== post.author._id && (
                            <>
                              <DropdownMenuItem onClick={() => handleDeletePost(post._id)}>
                                <Trash className="h-4 w-4 mr-2" /> Eliminar (admin)
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Pin className="h-4 w-4 mr-2" /> Fijar en el feed
                              </DropdownMenuItem>
                            </>
                          )}
                          { /* Si NO es el autor */}
                          {user?._id && post.author && user._id !== post.author._id && user?.role !== 'admin' && (
                            <>
                              <DropdownMenuItem disabled>
                                <Flag className="h-4 w-4 mr-2" /> Reportar
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Bell className="h-4 w-4 mr-2"  /> Apagar/encender notificaciones
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </CardHeader>
                  <CardContent className="pt-0">
                      { /* Indicador de post fijado */}
                      {post.pinned && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <Pin className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800 font-medium">Post fijado</span>
                          {post.pinnedBy && (
                            <span className="text-xs text-yellow-600">
                              por {post.pinnedBy.firstName} {post.pinnedBy.lastName}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div 
                        className="mb-2 text-gray-900 dark:text-gray-100 text-base prose prose-sm max-w-none [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-4 [&_ol]:ml-4 [&_a]:text-blue-500 [&_a]:underline"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                      { /* Imagen si existe */}
                      {post.image && (
                        <div className="mb-4">
                          <img src={post.image} alt="Imagen del post" className="w-full h-64 object-cover rounded-lg" />
                      </div>
                    )}
                    <div className="flex items-center space-x-6 pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleLikePost(post._id)}
                        className={`text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg ${
                          post.likes.includes(user?._id) ? 'text-red-600 bg-red-50 dark:bg-gray-700/30' : ''
                        }`}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${post.likes.includes(user?._id) ? 'fill-current' : ''}`} />
                        {post.likes.length > 0 ? post.likes.length : "Me gusta"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => !post.commentsDisabled && toggleComments(post._id)}
                        disabled={post.commentsDisabled}
                        className={`text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg ${
                          post.commentsDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title={post.commentsDisabled ? 'Los comentarios están desactivados' : ''}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {post.comments.length > 0 ? post.comments.length : "Comentar"}
                        {post.commentsDisabled && (
                          <span className="ml-1 text-xs text-red-500">(desactivados)</span>
                        )}
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

                    { /* Sección de Comentarios */}
                    {showComments[post._id] && !post.commentsDisabled && (
                      <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                        { /* Lista de comentarios existentes */}
                        {post.comments.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {post.comments.map((comment) => (
                              <div key={comment._id} className="flex space-x-3">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarImage src={getImageUrl(comment.author.profilePicture)} />
                                  <AvatarFallback className="text-xs">
                                    {comment.author.firstName?.[0]}{comment.author.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                      {comment.author.firstName} {comment.author.lastName}
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

                        { /* Campo para nuevo comentario */}
                        <div className="flex space-x-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={getImageUrl(user?.profilePicture)} />
                            <AvatarFallback className="text-xs">
                              {user?.firstName?.[0]}{user?.lastName?.[0]}
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
                      </div>
                    )}
                  </CardContent>
                </Card>
                ))
              )}
              
              { /* Botón para cargar más posts */}
              {!loadingPosts && posts.length > 0 && hasMorePosts && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={loadMorePosts}
                    disabled={loadingMore}
                    variant="outline"
                    className="px-6"
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Cargando...
                      </>
                    ) : (
                      "Cargar más posts"
                    )}
                  </Button>
                </div>
              )}
              
              { /* Mensaje cuando no hay más posts */}
              {!loadingPosts && posts.length > 0 && !hasMorePosts && (
                <div className="text-center py-8 text-gray-500">
                  No hay más posts para mostrar
                </div>
              )}
            </div>
          </div>

          { /* Columna Derecha - Widgets */}
          <div className="lg:col-span-3 space-y-6">
            { /* Widget Completa el teu Perfil */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Completa el teu Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress circle */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="stroke-gray-200"
                        fill="none"
                        strokeWidth="3"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="stroke-green-500"
                        fill="none"
                        strokeWidth="3"
                        strokeDasharray={`${percent}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">
                        {percent}
                        <span className="text-sm text-gray-500">%</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Completat</p>
                </div>
                {/* Progress items */}
                <div className="space-y-3">
                  {profileSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {step.complete ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={`text-sm ${step.complete ? 'text-gray-900' : 'text-gray-600'}`}>
                          {step.label}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {step.done}/{step.total}
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/editar-perfil')}>
                  Completar Perfil
                </Button>
              </CardContent>
            </Card>
            { /* Empresas Widget */}
            <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-purple-500" />
                    Empreses
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600"
                    onClick={() => navigate('/companies')}
                  >
                    Ver totes
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingWidgets ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-2">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : companies.length > 0 ? (
                  companies.map((company) => (
                    <div 
                      key={company._id} 
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigate(`/empresa/${company._id}`)}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700/50">
                        {company.logo ? (
                          <img src={getImageUrl(company.logo)} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building className="h-5 w-5 text-purple-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{company.name}</p>
                          {company.verified?.status === 'verified' && (
                            <Award className="h-3 w-3 text-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {company.stats?.employees && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{company.stats.employees} empleats</span>
                          )}
                          {company.location?.city && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{company.location.city}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Building className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha empreses</p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 border-purple-200 dark:border-gray-600 text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  onClick={() => navigate('/companies')}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Explorar Empreses
                </Button>
              </CardContent>
            </Card>
            { /* Colaboradores Widget */}
            <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-green-500" />
                    Col·laboradors
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-green-600"
                    onClick={() => navigate('/membres')}
                  >
                    Ver tots
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingWidgets ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : collaborators.length > 0 ? (
                  collaborators.map((collaborator) => (
                    <div 
                      key={collaborator._id} 
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigate(`/usuario/${collaborator.slug || collaborator._id}`)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getImageUrl(collaborator.profilePicture)} />
                          <AvatarFallback>{collaborator.firstName?.charAt(0)}{collaborator.lastName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          collaborator.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {collaborator.firstName} {collaborator.lastName}
                          </p>
                          <Badge variant="secondary" className="text-xs">Col·laborador</Badge>
                        </div>
                        {collaborator.workExperience?.[0]?.position && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {collaborator.workExperience[0].position}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <UserPlus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha col·laboradors</p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 border-green-200 dark:border-gray-600 text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  onClick={() => navigate('/membres')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Trobar Col·laboradors
                </Button>
              </CardContent>
            </Card>
            
            { /* Ofertas de Trabajo Widget */}
            <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                    Ofertes de Treball
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600"
                    onClick={() => navigate('/ofertes')}
                  >
                    Ver totes
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingWidgets ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-2">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))
                ) : jobOffers.length > 0 ? (
                  jobOffers.map((offer) => (
                    <div 
                      key={offer._id} 
                      className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigate(`/ofertes/${offer._id}`)}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                        {offer.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {offer.company?.name && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {offer.company.name}
                          </span>
                        )}
                        {offer.location && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {typeof offer.location === 'string' ? offer.location : offer.location.city}
                            </span>
                          </>
                        )}
                      </div>
                      {offer.salary && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {offer.salary.min && offer.salary.max 
                              ? `${offer.salary.min}-${offer.salary.max}€`
                              : typeof offer.salary === 'object' && offer.salary.amount 
                                ? `${offer.salary.amount}€`
                                : 'Salari a convenir'
                            }
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha ofertes disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            { /* Asesorías Widget */}
            <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-500" />
                    Assessoraments
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600"
                    onClick={() => navigate('/assessorament')}
                  >
                    Ver tots
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingWidgets ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-2">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))
                ) : advisories.length > 0 ? (
                  advisories.map((advisory) => (
                    <div 
                      key={advisory._id} 
                      className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigate(`/assessorament/${advisory._id}`)}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                        {advisory.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {advisory.company?.name && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {advisory.company.name}
                          </span>
                        )}
                        {advisory.duration && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {advisory.duration} min
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {advisory.format && (
                          <Badge variant="secondary" className="text-xs">
                            {advisory.format === 'video' ? 'Vídeo' : 
                             advisory.format === 'phone' ? 'Telèfon' : 
                             advisory.format === 'presential' ? 'Presencial' : 
                             advisory.format === 'email' ? 'Email' : 'Xat'}
                          </Badge>
                        )}
                        {advisory.pricing?.type === 'free' ? (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Gratuït
                          </Badge>
                        ) : (advisory.pricing?.hourlyRate || advisory.pricing?.sessionRate) && (
                          <Badge variant="outline" className="text-xs">
                            {advisory.pricing?.hourlyRate 
                              ? `${advisory.pricing.hourlyRate}€/h`
                              : advisory.pricing?.sessionRate
                                ? `${advisory.pricing.sessionRate}€/sessió`
                                : 'Preu a convenir'
                            }
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha assessoraments disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      { /* Modal de edición de post */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Editar publicación</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getImageUrl(user?.profilePicture)} />
                <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{user?.firstName} {user?.lastName}</div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded px-2 py-1 mt-1">
                  Editando publicación
                </div>
              </div>
            </div>
            <RichTextEditor
              value={editContent}
              onChange={setEditContent}
              placeholder="Edita la teva publicació..."
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

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
import { fetchUserFeed, createPost, updatePost, toggleLikePost, commentOnPost, togglePostComments, togglePostPin } from "@/api/posts";
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
  
   // Estados para herramientas de posts
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPollOptions, setShowPollOptions] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDuration, setPollDuration] = useState("1d");
  const [selectedMood, setSelectedMood] = useState<{emoji: string, label: string} | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

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

   // Calcular progreso de perfil (removido, se usa la lógica de profileSteps más abajo)
  
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
      complete: [user?.firstName, user?.lastName, user?.email, user?.bio, user?.gender, user?.birthDate].filter(Boolean).length >= 5,  // Completo con al menos 5 de 6 campos
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
    fetchUserFeed(1, 20) // Cargar 20 posts inicialmente
      .then((res) => {
        setPosts(res.data || []);
        setHasMorePosts((res.data || []).length === 20);
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
            { /* Mis Grupos Widget */}
            <Card className="bg-white dark:bg-gray-800/50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Mis Grupos
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-blue-600">
                    Ver todos
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myGroups.map((group, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{group.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{group.members} miembros</span>
                        {group.isPrivate && (
                          <Badge variant="secondary" className="text-xs">Privado</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            { /* Blog Widget */}
            <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-orange-500" />
                  Blog
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {blogPosts.slice(0, 4).map((post, index) => (
                  <div key={index} className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">{post.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{post.date}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-gray-600 dark:text-gray-400 mt-4 hover:bg-gray-100 dark:hover:bg-gray-800">
                  VER TODOS
                </Button>
              </CardContent>
            </Card>
          </div>

          { /* Columna Central - Activity Feed */}
          <div className="lg:col-span-6 space-y-6">
            { /* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Activity Feed</h1>
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
                        placeholder={`¿Qué estás pensando, ${user?.firstName}?`}
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
                    placeholder={`Comparte algo con la comunidad, ${user?.firstName}...`}
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
                            placeholder={`Opción ${index + 1}`}
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
                                placeholder="Escribe un comentario..."
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
            { /* Widget Completa tu Perfil */}
            <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-base font-semibold text-gray-900 dark:text-gray-100">Completa tu Perfil</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="relative flex flex-col items-center w-full">
                  <SemiCircularProgress value={percent} size={180} strokeWidth={14} color="#2563eb">
                    <span className="text-sm text-gray-400 dark:text-gray-400 font-medium">Completado</span>
                  </SemiCircularProgress>
                </div>
                <ul className="w-full flex flex-col gap-0 relative pl-2 pr-4 mb-2 mt-2">
                  {profileSteps.map((step, idx) => (
                    <li key={idx} className="flex items-center gap-3 min-h-[28px] relative">
                      { /* Stepper vertical line */}
                      {idx < profileSteps.length - 1 && (
                        <span className="absolute left-2 top-6 w-px h-[24px] bg-gray-200 dark:bg-gray-600 z-0" />
                      )}
                      { /* Step icon */}
                      <span className="relative z-10 flex items-center justify-center h-5 w-5">
                        {step.complete ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="9" stroke="#2563eb" strokeWidth="2" fill="none" />
                            <path d="M6 10.5L9 13.5L14 8.5" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="dark:opacity-60">
                            <circle cx="10" cy="10" r="9" stroke="#d1d5db" strokeWidth="2" fill="none" />
                          </svg>
                        )}
                      </span>
                      { /* Step label and count */}
                      <span className={
                        step.complete
                          ? "font-semibold text-[#2563eb] flex-1 text-base"
                          : "text-gray-400 dark:text-gray-500 flex-1 text-base"
                      }>
                        {step.label}
                      </span>
                      <span className={step.complete ? "font-semibold text-[#2563eb] text-xs" : "text-gray-400 dark:text-gray-500 text-xs"}>
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
            { /* Empresas Widget */}
            <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-purple-500" />
                    Empresas
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600">
                    Ver todas
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {companies.map((company, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700/50">
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{company.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{company.employees} empleados</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{company.industry}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3 border-purple-200 dark:border-gray-600 text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <Building className="h-4 w-4 mr-2" />
                  Explorar Empresas
                </Button>
              </CardContent>
            </Card>
            { /* Colaboradores Widget */}
            <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-green-500" />
                    Colaboradores
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500 dark:text-gray-400 hover:text-green-600">
                    Ver todos
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collaborators.map((collaborator, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
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
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{collaborator.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{collaborator.role}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3 border-green-200 dark:border-gray-600 text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invitar Colaboradores
                </Button>
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

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Plus, MessageSquare, Eye, Clock, ThumbsUp, ThumbsDown, 
  Pin, Lock, Flag, MoreHorizontal, Edit, Trash, Reply, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageWrapper } from "@/components/PageWrapper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  getForumById, 
  getForumPosts, 
  likeForumPost, 
  dislikeForumPost,
  type Forum, 
  type ForumPost 
} from "@/api/forums";
import { getImageUrl } from "@/utils/getImageUrl";

const ForumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [forum, setForum] = useState<Forum | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'lastActivity' | 'newest' | 'oldest' | 'mostLiked' | 'mostReplies'>('lastActivity');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (id) {
      loadForum();
      loadPosts();
    }
  }, [id, sortBy, currentPage]);

  const loadForum = async () => {
    try {
      setLoading(true);
      const response = await getForumById(id!);
      if (response.success) {
        setForum(response.data);
      }
    } catch (error) {
      toast.error('Error al cargar el foro');
      navigate('/forums');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await getForumPosts(id!, {
        page: currentPage,
        limit: 20,
        sortBy
      });
      if (response.success) {
        setPosts(response.data);
      }
    } catch (error) {
      toast.error('Error al cargar los posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likeForumPost(postId);
      loadPosts(); // Recargar para actualizar contadores
    } catch (error) {
      toast.error('Error al dar like');
    }
  };

  const handleDislike = async (postId: string) => {
    try {
      await dislikeForumPost(postId);
      loadPosts(); // Recargar para actualizar contadores
    } catch (error) {
      toast.error('Error al dar dislike');
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'ahora mismo';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `hace ${diffInDays}d`;
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!forum) {
    return (
      <PageWrapper>
        <div className="text-center">
          <p>Foro no encontrado</p>
          <Button onClick={() => navigate('/forums')} className="mt-4">
            Volver a Foros
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/forums')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{forum.name}</h1>
              {forum.isPinned && <Pin className="h-5 w-5 text-primary" />}
              {forum.isLocked && <Lock className="h-5 w-5 text-gray-400" />}
            </div>
            <p className="text-gray-600">{forum.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge 
                variant="secondary" 
                style={{ backgroundColor: forum.category.color + '20', color: forum.category.color }}
              >
                {forum.category.name}
              </Badge>
              <span className="text-sm text-gray-500">{forum.postCount} posts</span>
            </div>
          </div>
          {!forum.isLocked && (
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate(`/forums/${forum._id}/new-post`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Post
            </Button>
          )}
        </div>

        {/* Forum Rules */}
        {forum.rules && forum.rules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reglas del Foro</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {forum.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-semibold">{index + 1}.</span>
                    <span className="text-gray-700">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="lastActivity">Actividad reciente</option>
            <option value="newest">Más nuevos</option>
            <option value="oldest">Más antiguos</option>
            <option value="mostLiked">Más votados</option>
            <option value="mostReplies">Más respuestas</option>
          </select>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {postsLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay posts en este foro</p>
                <p className="text-sm text-gray-400 mt-1">
                  ¡Sé el primero en iniciar una conversación!
                </p>
                {!forum.isLocked && (
                  <Button 
                    className="mt-4"
                    onClick={() => navigate(`/forums/${forum._id}/new-post`)}
                  >
                    Crear primer post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card 
                key={post._id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/forums/posts/${post._id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={getImageUrl(post.author.profilePicture)} 
                          alt={`${post.author.firstName} ${post.author.lastName}`}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {post.author.firstName[0]}{post.author.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                          {post.isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                          <h3 className="font-semibold text-gray-900 hover:text-primary">
                            {post.title}
                          </h3>
                        </div>
                        <div className="text-gray-700 text-sm mb-2 line-clamp-2">
                          <div dangerouslySetInnerHTML={{ 
                            __html: post.content.length > 150 
                              ? post.content.substring(0, 150) + '...' 
                              : post.content 
                          }} />
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            por {post.author.firstName} {post.author.lastName}
                          </span>
                          <span>{formatTimeAgo(post.createdAt)}</span>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-1">
                              {post.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.likes.length}</span>
                        </div>
                        <span className="text-xs">likes</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.replyCount}</span>
                        </div>
                        <span className="text-xs">respuestas</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.viewCount}</span>
                        </div>
                        <span className="text-xs">vistas</span>
                      </div>
                      <div className="text-center min-w-0">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTimeAgo(post.lastActivity)}</span>
                        </div>
                        <span className="text-xs">actividad</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ForumDetail;
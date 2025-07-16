import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ThumbsUp, ThumbsDown, Flag, Reply, Edit, Trash, 
  MoreHorizontal, Pin, Lock, Eye, Clock, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/PageWrapper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  getForumPostById, 
  likeForumPost, 
  dislikeForumPost,
  createForumPost,
  reportForumPost,
  type ForumPost 
} from "@/api/forums";
import { getImageUrl } from "@/utils/getImageUrl";

const ForumPostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await getForumPostById(id!);
      if (response.success) {
        setPost(response.data.post);
        setReplies(response.data.replies);
      }
    } catch (error) {
      toast.error('Error al cargar el post');
      navigate('/forums');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likeForumPost(postId);
      loadPost();  // Recargar para actualizar contadores
    } catch (error) {
      toast.error('Error al dar like');
    }
  };

  const handleDislike = async (postId: string) => {
    try {
      await dislikeForumPost(postId);
      loadPost();  // Recargar para actualizar contadores
    } catch (error) {
      toast.error('Error al dar dislike');
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('El contenido de la respuesta es obligatorio');
      return;
    }

    try {
      setSubmittingReply(true);
      const response = await createForumPost({
        title: `Re: ${post?.title}`,
        content: replyContent.trim(),
        forumId: post!.forum._id,
        parentPostId: post!._id
      });

      if (response.success) {
        toast.success('Respuesta creada exitosamente');
        setReplyContent("");
        setShowReplyForm(false);
        loadPost();  // Recargar para mostrar nueva respuesta
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear la respuesta');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast.error('Debes seleccionar una razón');
      return;
    }

    try {
      await reportForumPost(post!._id, {
        reason: reportReason as any,
        description: reportDescription
      });
      toast.success('Post reportado exitosamente');
      setShowReportDialog(false);
      setReportReason("");
      setReportDescription("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al reportar el post');
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
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3 /4" />
                    <Skeleton className="h-4 w-1 /2" />
                  </div>
                </div>
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  if (!post) {
    return (
      <PageWrapper>
        <div className="text-center">
          <p>Post no encontrado</p>
          <Button onClick={() => navigate('/forums')} className="mt-4">
            Volver a Foros
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        { /* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/forums/${post.forum._id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Foro
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {post.isPinned && <Pin className="h-5 w-5 text-primary" />}
              {post.isLocked && <Lock className="h-5 w-5 text-gray-400" />}
              <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
            </div>
            <p className="text-gray-600">en {post.forum.name}</p>
          </div>
        </div>

        { /* Main Post */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={getImageUrl(post.author.profilePicture)} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {post.author.firstName[0]}{post.author.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {post.author.firstName} {post.author.lastName}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.viewCount} vistas
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post.replyCount} respuestas
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTimeAgo(post.lastActivity)}
                    </span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                    <Flag className="h-4 w-4 mr-2" />
                    Reportar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            { /* Content */}
            <div className="prose max-w-none mb-4">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            { /* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            { /* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleLike(post._id)}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {post.likes.length}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDislike(post._id)}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  {post.dislikes.length}
                </Button>
              </div>
              {!post.isLocked && (
                <Button 
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-2"
                >
                  <Reply className="h-4 w-4" />
                  Responder
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        { /* Reply Form */}
        {showReplyForm && !post.isLocked && (
          <Card>
            <CardHeader>
              <CardTitle>Escribir Respuesta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reply">Tu respuesta</Label>
                  <Textarea
                    id="reply"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    rows={6}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleReply}
                    disabled={submittingReply || !replyContent.trim()}
                  >
                    {submittingReply ? 'Enviando...' : 'Enviar Respuesta'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        { /* Replies */}
        {replies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Respuestas ({replies.length})
            </h2>
            {replies.map((reply) => (
              <Card key={reply._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getImageUrl(reply.author.profilePicture)} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {reply.author.firstName[0]}{reply.author.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {reply.author.firstName} {reply.author.lastName}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(reply.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="prose max-w-none mb-4">
                    <div dangerouslySetInnerHTML={{ __html: reply.content }} />
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLike(reply._id)}
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {reply.likes.length}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDislike(reply._id)}
                      className="flex items-center gap-2"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      {reply.dislikes.length}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        { /* Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reportar Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Razón *</Label>
                <select
                  id="reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecciona una razón</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Contenido inapropiado</option>
                  <option value="harassment">Acoso</option>
                  <option value="misinformation">Desinformación</option>
                  <option value="copyright">Violación de derechos de autor</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Proporciona más detalles sobre el problema..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleReport} disabled={!reportReason}>
                  Enviar Reporte
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
};

export default ForumPostDetail;
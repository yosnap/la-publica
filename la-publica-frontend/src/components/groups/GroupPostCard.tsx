import { useState } from "react";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Pin,
  Edit,
  Trash2,
  MessageSquareOff,
  Flag,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  toggleLikeGroupPost,
  addCommentToGroupPost,
  deleteCommentFromGroupPost,
  deleteGroupPost,
  togglePinGroupPost,
  toggleCommentsGroupPost,
  type GroupPost
} from "@/api/groupPosts";
import { getImageUrl } from "@/utils/getImageUrl";

interface GroupPostCardProps {
  post: GroupPost;
  currentUserId: string;
  userGroupRole?: 'admin' | 'moderator' | 'member';
  onPostUpdate?: () => void;
  onPostDelete?: () => void;
  className?: string;
}

export const GroupPostCard = ({
  post,
  currentUserId,
  userGroupRole,
  onPostUpdate,
  onPostDelete,
  className = ""
}: GroupPostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUserId));
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  const isAuthor = post.author._id === currentUserId;
  const canModerate = userGroupRole === 'admin' || userGroupRole === 'moderator';
  const canEdit = isAuthor;  // Solo el autor puede editar por ahora
  const canDelete = isAuthor || canModerate;

  const handleToggleLike = async () => {
    try {
      const response = await toggleLikeGroupPost(post.group._id, post._id);
      if (response.success) {
        setIsLiked(response.data.liked);
        setLikesCount(response.data.likesCount);
      }
    } catch (error: any) {
      toast.error("Error al procesar el like");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setAddingComment(true);
      const response = await addCommentToGroupPost(post.group._id, post._id, newComment.trim());
      
      if (response.success) {
        setComments(prev => [...prev, response.data]);
        setNewComment("");
        toast.success("Comentario agregado");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al agregar comentario");
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await deleteCommentFromGroupPost(post.group._id, post._id, commentId);
      
      if (response.success) {
        setComments(prev => prev.filter(c => c._id !== commentId));
        toast.success("Comentario eliminado");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar comentario");
    }
  };

  const handleDeletePost = async () => {
    try {
      const response = await deleteGroupPost(post.group._id, post._id);
      
      if (response.success) {
        toast.success("Post eliminado");
        if (onPostDelete) {
          onPostDelete();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar post");
    }
  };

  const handleTogglePin = async () => {
    try {
      const response = await togglePinGroupPost(post.group._id, post._id);
      
      if (response.success) {
        toast.success(response.message);
        if (onPostUpdate) {
          onPostUpdate();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cambiar estado de fijado");
    }
  };

  const handleToggleComments = async () => {
    try {
      const response = await toggleCommentsGroupPost(post.group._id, post._id);
      
      if (response.success) {
        toast.success(response.message);
        if (onPostUpdate) {
          onPostUpdate();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cambiar estado de comentarios");
    }
  };

  return (
    <Card className={`shadow-sm border-0 bg-white ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          { /* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={getImageUrl(post.author.profilePicture)} />
                <AvatarFallback>
                  {post.author.firstName[0]}{post.author.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">
                    {post.author.firstName} {post.author.lastName}
                  </span>
                  {post.isPinned && (
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                      <Pin className="h-3 w-3 mr-1" />
                      Fijado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  {post.mood && (
                    <>
                      <span>•</span>
                      <span>se siente {post.mood.emoji} {post.mood.label}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            { /* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                
                {canModerate && (
                  <>
                    <DropdownMenuItem onClick={handleTogglePin}>
                      <Pin className="h-4 w-4 mr-2" />
                      {post.isPinned ? "Desfijar" : "Fijar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleComments}>
                      <MessageSquareOff className="h-4 w-4 mr-2" />
                      {post.commentsDisabled ? "Habilitar comentarios" : "Deshabilitar comentarios"}
                    </DropdownMenuItem>
                  </>
                )}

                {!isAuthor && (
                  <DropdownMenuItem>
                    <Flag className="h-4 w-4 mr-2" />
                    Reportar
                  </DropdownMenuItem>
                )}

                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar post?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El post será eliminado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeletePost}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          { /* Content */}
          <div>
            <div 
              className="prose prose-sm max-w-none [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-4 [&_ol]:ml-4 [&_a]:text-blue-500 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          { /* Images */}
          {post.images && post.images.length > 0 && (
            <div className={`grid gap-2 ${
              post.images.length === 1 ? 'grid-cols-1' :
              post.images.length === 2 ? 'grid-cols-2' :
              'grid-cols-2 md:grid-cols-3'
            }`}>
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={getImageUrl(image)}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          )}

          { /* Interaction stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 pt-2 border-t">
            <span>{likesCount} me gusta</span>
            <span>{comments.length} comentarios</span>
          </div>

          { /* Action buttons */}
          <div className="flex items-center space-x-6 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>Me gusta</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              disabled={post.commentsDisabled}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comentar</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-500"
            >
              <Share2 className="h-4 w-4" />
              <span>Compartir</span>
            </Button>
          </div>

          { /* Comments section */}
          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              { /* Add comment */}
              {!post.commentsDisabled && (
                <div className="flex space-x-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={getImageUrl()} />
                    <AvatarFallback>TU</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <RichTextEditor
                      value={newComment}
                      onChange={(value) => setNewComment(value)}
                      placeholder="Escribe un comentario..."
                      className="min-h-[60px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || addingComment}
                      >
                        {addingComment ? "Comentando..." : "Comentar"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              { /* Comments disabled message */}
              {post.commentsDisabled && (
                <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
                  <MessageSquareOff className="h-4 w-4 mr-2" />
                  Los comentarios están deshabilitados
                </div>
              )}

              { /* Comments list */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={getImageUrl(comment.author.profilePicture)} />
                      <AvatarFallback>
                        {comment.author.firstName[0]}{comment.author.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {comment.author.firstName} {comment.author.lastName}
                          </span>
                          {(comment.author._id === currentUserId || canModerate) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment._id)}
                              className="h-auto p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs hover:text-blue-500"
                        >
                          Me gusta
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
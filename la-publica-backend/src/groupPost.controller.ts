import { Request, Response } from 'express';
import mongoose from 'mongoose';
import GroupPost from './groupPost.model';
import Group from './group.model';
import User from './user.model';

// Crear un nuevo post en un grupo
export const createGroupPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { groupId } = req.params;
    const { content, images, attachments, mentions, mood, privacy } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El contenido del post es requerido'
      });
    }

    // Verificar que el grupo existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    // Verificar que el usuario es miembro del grupo
    const isMember = group.members.some(member => member.user.toString() === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Debes ser miembro del grupo para publicar'
      });
    }

    // Obtener rol del usuario en el grupo
    const userMember = group.members.find(member => member.user.toString() === userId);
    const userRole = userMember?.role || 'member';

    // Determinar si el post necesita aprobación (según configuración del grupo)
    // Por ahora, todos los posts se aprueban automáticamente
    const isApproved = true;

    const post = new GroupPost({
      content: content.trim(),
      author: userId,
      group: groupId,
      images: images || [],
      attachments: attachments || [],
      mentions: mentions || [],
      mood,
      privacy: privacy || 'members_only',
      isApproved
    });

    await post.save();

    const populatedPost = await GroupPost.findById(post._id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('group', 'name')
      .populate('mentions', 'username firstName lastName')
      .populate('comments.author', 'username firstName lastName profilePicture');

    return res.status(201).json({
      success: true,
      data: populatedPost,
      message: 'Post creado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al crear el post',
      error: error.message
    });
  }
};

// Obtener posts de un grupo
export const getGroupPosts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { groupId } = req.params;
    const { page = 1, limit = 10, pinned } = req.query;

    // Verificar que el grupo existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    // Para grupos privados, verificar membresía
    if (group.privacy === 'private') {
      const isMember = group.members.some(member => member.user.toString() === userId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver los posts de este grupo privado'
        });
      }
    }

    // Obtener rol del usuario en el grupo
    const userMember = group.members.find(member => member.user.toString() === userId);
    const userRole = userMember?.role || null;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Construir query
    let query: any = {
      group: groupId,
      isActive: true
    };

    // Solo mostrar posts aprobados a miembros regulares
    if (!userRole || userRole === 'member') {
      query.isApproved = true;
    }

    // Filtro para posts pinned
    if (pinned === 'true') {
      query.isPinned = true;
    } else if (pinned === 'false') {
      query.isPinned = false;
    }

    const posts = await GroupPost.find(query)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('group', 'name')
      .populate('mentions', 'username firstName lastName')
      .populate('comments.author', 'username firstName lastName profilePicture')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    // Filtrar posts que el usuario puede ver
    const visiblePosts = posts.filter(post => 
      post.canUserView(userId, userRole || undefined)
    );

    const total = await GroupPost.countDocuments(query);

    return res.json({
      success: true,
      data: visiblePosts,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los posts',
      error: error.message
    });
  }
};

// Obtener un post específico
export const getGroupPostById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { groupId, postId } = req.params;

    const post = await GroupPost.findOne({ _id: postId, group: groupId })
      .populate('author', 'username firstName lastName profilePicture')
      .populate('group', 'name privacy')
      .populate('mentions', 'username firstName lastName')
      .populate('comments.author', 'username firstName lastName profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Verificar permisos para ver el grupo
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    // Para grupos privados, verificar membresía
    if (group.privacy === 'private') {
      const isMember = group.members.some(member => member.user.toString() === userId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este post'
        });
      }
    }

    // Obtener rol del usuario
    const userMember = group.members.find(member => member.user.toString() === userId);
    const userRole = userMember?.role || null;

    // Verificar si puede ver el post
    if (!post.canUserView(userId, userRole || undefined)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este post'
      });
    }

    return res.json({
      success: true,
      data: post
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el post',
      error: error.message
    });
  }
};

// Actualizar un post
export const updateGroupPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { groupId, postId } = req.params;
    const { content, images, attachments, mentions, mood, privacy } = req.body;

    const post = await GroupPost.findOne({ _id: postId, group: groupId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Verificar que el grupo existe y obtener rol del usuario
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    const userMember = group.members.find(member => member.user.toString() === userId);
    const userRole = userMember?.role || null;

    // Verificar permisos de edición
    if (!post.canUserEdit(userId, userRole || undefined)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este post'
      });
    }

    // Guardar en historial si el contenido cambió
    if (content && content !== post.content) {
      post.editHistory = post.editHistory || [];
      post.editHistory.push({
        content: post.content,
        editedAt: new Date(),
        editedBy: userId
      } as any);
    }

    // Actualizar campos
    if (content) post.content = content.trim();
    if (images !== undefined) post.images = images;
    if (attachments !== undefined) post.attachments = attachments;
    if (mentions !== undefined) post.mentions = mentions;
    if (mood !== undefined) post.mood = mood;
    if (privacy !== undefined) post.privacy = privacy;

    await post.save();

    const populatedPost = await GroupPost.findById(post._id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('group', 'name')
      .populate('mentions', 'username firstName lastName')
      .populate('comments.author', 'username firstName lastName profilePicture');

    return res.json({
      success: true,
      data: populatedPost,
      message: 'Post actualizado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el post',
      error: error.message
    });
  }
};

// Eliminar un post
export const deleteGroupPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { groupId, postId } = req.params;

    const post = await GroupPost.findOne({ _id: postId, group: groupId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Verificar que el grupo existe y obtener rol del usuario
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    const userMember = group.members.find(member => member.user.toString() === userId);
    const userRole = userMember?.role || null;

    // Verificar permisos de eliminación
    const canDelete = post.author.toString() === userId || 
                      ['admin', 'moderator'].includes(userRole || '');

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este post'
      });
    }

    await post.deleteOne();

    return res.json({
      success: true,
      message: 'Post eliminado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el post',
      error: error.message
    });
  }
};

// Like/Unlike un post
export const toggleLikeGroupPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { groupId, postId } = req.params;

    const post = await GroupPost.findOne({ _id: postId, group: groupId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Verificar acceso al grupo
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    if (group.privacy === 'private') {
      const isMember = group.members.some(member => member.user.toString() === userId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para interactuar con este post'
        });
      }
    }

    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes = post.likes.filter(like => like.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    return res.json({
      success: true,
      data: {
        liked: !hasLiked,
        likesCount: post.likes.length
      },
      message: hasLiked ? 'Like removido' : 'Like agregado'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al procesar el like',
      error: error.message
    });
  }
};

// Agregar comentario a un post
export const addCommentToGroupPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { groupId, postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El contenido del comentario es requerido'
      });
    }

    const post = await GroupPost.findOne({ _id: postId, group: groupId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    if (post.commentsDisabled) {
      return res.status(403).json({
        success: false,
        message: 'Los comentarios están deshabilitados para este post'
      });
    }

    // Verificar acceso al grupo
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    if (group.privacy === 'private') {
      const isMember = group.members.some(member => member.user.toString() === userId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para comentar en este post'
        });
      }
    }

    const comment = {
      _id: new mongoose.Types.ObjectId(),
      author: userId,
      content: content.trim(),
      createdAt: new Date(),
      likes: []
    };

    post.comments.push(comment as any);
    await post.save();

    const populatedPost = await GroupPost.findById(post._id)
      .populate('comments.author', 'username firstName lastName profilePicture');

    const newComment = populatedPost?.comments.find(c => c._id.toString() === comment._id.toString());

    return res.status(201).json({
      success: true,
      data: newComment,
      message: 'Comentario agregado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al agregar comentario',
      error: error.message
    });
  }
};

// Eliminar comentario
export const deleteCommentFromGroupPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { groupId, postId, commentId } = req.params;

    const post = await GroupPost.findOne({ _id: postId, group: groupId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    const comment = post.comments.find(c => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    // Verificar permisos
    const group = await Group.findById(groupId);
    const userMember = group?.members.find(member => member.user.toString() === userId);
    const userRole = userMember?.role || null;

    const canDelete = comment.author.toString() === userId || 
                      ['admin', 'moderator'].includes(userRole || '');

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este comentario'
      });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();

    return res.json({
      success: true,
      message: 'Comentario eliminado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar comentario',
      error: error.message
    });
  }
};

// Toggle pin post (solo admin/moderador)
export const togglePinGroupPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { groupId, postId } = req.params;

    const post = await GroupPost.findOne({ _id: postId, group: groupId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Verificar permisos de moderación
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    const userMember = group.members.find(member => member.user.toString() === userId);
    const userRole = userMember?.role || null;

    if (!['admin', 'moderator'].includes(userRole || '')) {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores y moderadores pueden fijar posts'
      });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    return res.json({
      success: true,
      data: {
        isPinned: post.isPinned
      },
      message: post.isPinned ? 'Post fijado exitosamente' : 'Post desfijado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de fijado',
      error: error.message
    });
  }
};

// Toggle disable comments (solo admin/moderador)
export const toggleCommentsGroupPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { groupId, postId } = req.params;

    const post = await GroupPost.findOne({ _id: postId, group: groupId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Verificar permisos de moderación
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    const userMember = group.members.find(member => member.user.toString() === userId);
    const userRole = userMember?.role || null;

    if (!['admin', 'moderator'].includes(userRole || '')) {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores y moderadores pueden deshabilitar comentarios'
      });
    }

    post.commentsDisabled = !post.commentsDisabled;
    await post.save();

    return res.json({
      success: true,
      data: {
        commentsDisabled: post.commentsDisabled
      },
      message: post.commentsDisabled ? 'Comentarios deshabilitados' : 'Comentarios habilitados'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de comentarios',
      error: error.message
    });
  }
};
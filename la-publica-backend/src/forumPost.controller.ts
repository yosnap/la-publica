import { Request, Response } from 'express';
import ForumPost from './forumPost.model';
import Forum from './forum.model';
import mongoose from 'mongoose';

// Crear un nuevo post en el foro
export const createForumPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { title, content, forumId, parentPostId, tags } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!title || !content || !forumId) {
      return res.status(400).json({
        success: false,
        message: 'Título, contenido y foro son requeridos'
      });
    }

    // Verificar que el foro existe y está activo
    const forum = await Forum.findById(forumId);
    if (!forum || !forum.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Foro no encontrado o inactivo'
      });
    }

    // Verificar si el foro está bloqueado
    if (forum.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'Este foro está bloqueado para nuevos posts'
      });
    }

    // Si es una respuesta, verificar que el post padre existe
    if (parentPostId) {
      const parentPost = await ForumPost.findById(parentPostId);
      if (!parentPost || !parentPost.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Post padre no encontrado'
        });
      }

      if (parentPost.isLocked) {
        return res.status(403).json({
          success: false,
          message: 'Este post está bloqueado para respuestas'
        });
      }
    }

    const post = new ForumPost({
      title,
      content,
      author: userId,
      forum: forumId,
      parentPost: parentPostId || undefined,
      tags: tags || []
    });

    await post.save();
    await post.populate([
      { path: 'author', select: 'firstName lastName profilePicture' },
      { path: 'forum', select: 'name' }
    ]);

    // Actualizar estadísticas del foro
    await (forum as any).updateStats();

    return res.status(201).json({
      success: true,
      data: post,
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

// Listar posts de un foro
export const getForumPosts = async (req: Request, res: Response) => {
  try {
    const { forumId } = req.params;
    const { page = 1, limit = 20, sortBy = 'lastActivity' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(forumId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de foro inválido'
      });
    }

    // Verificar que el foro existe
    const forum = await Forum.findById(forumId);
    if (!forum || !forum.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Foro no encontrado'
      });
    }

    const query: any = { 
      forum: forumId, 
      isActive: true, 
      isApproved: true,
      parentPost: { $exists: false } // Solo posts principales, no respuestas
    };

    const skip = (Number(page) - 1) * Number(limit);
    
    let sortOption: any = {};
    switch (sortBy) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'mostLiked':
        sortOption = { 'likes.length': -1 };
        break;
      case 'mostReplies':
        sortOption = { replyCount: -1 };
        break;
      default:
        sortOption = { isPinned: -1, lastActivity: -1 };
    }

    const posts = await ForumPost.find(query)
      .populate('author', 'firstName lastName profilePicture')
      .populate('forum', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await ForumPost.countDocuments(query);

    return res.json({
      success: true,
      data: posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
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

// Obtener un post específico con sus respuestas
export const getForumPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de post inválido'
      });
    }

    // Obtener el post principal
    const post = await ForumPost.findById(id)
      .populate('author', 'firstName lastName profilePicture')
      .populate('forum', 'name description rules')
      .populate('likes', 'firstName lastName')
      .populate('dislikes', 'firstName lastName');

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Incrementar vistas
    await (post as any).incrementViews();

    // Obtener respuestas paginadas
    const skip = (Number(page) - 1) * Number(limit);
    const replies = await ForumPost.find({
      parentPost: id,
      isActive: true,
      isApproved: true
    })
      .populate('author', 'firstName lastName profilePicture')
      .populate('likes', 'firstName lastName')
      .populate('dislikes', 'firstName lastName')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit));

    const totalReplies = await ForumPost.countDocuments({
      parentPost: id,
      isActive: true,
      isApproved: true
    });

    return res.json({
      success: true,
      data: {
        post,
        replies,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalReplies,
          pages: Math.ceil(totalReplies / Number(limit))
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el post',
      error: error.message
    });
  }
};

// Dar like a un post
export const likePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    const post = await ForumPost.findById(id);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    const hasLiked = post.likes.includes(userId);
    const hasDisliked = post.dislikes.includes(userId);

    if (hasLiked) {
      // Quitar like
      post.likes = post.likes.filter(like => like.toString() !== userId);
    } else {
      // Agregar like
      post.likes.push(userId);
      // Quitar dislike si existe
      if (hasDisliked) {
        post.dislikes = post.dislikes.filter(dislike => dislike.toString() !== userId);
      }
    }

    await post.save();

    return res.json({
      success: true,
      data: {
        likes: post.likes.length,
        dislikes: post.dislikes.length,
        hasLiked: !hasLiked,
        hasDisliked: false
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al procesar like',
      error: error.message
    });
  }
};

// Dar dislike a un post
export const dislikePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    const post = await ForumPost.findById(id);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    const hasLiked = post.likes.includes(userId);
    const hasDisliked = post.dislikes.includes(userId);

    if (hasDisliked) {
      // Quitar dislike
      post.dislikes = post.dislikes.filter(dislike => dislike.toString() !== userId);
    } else {
      // Agregar dislike
      post.dislikes.push(userId);
      // Quitar like si existe
      if (hasLiked) {
        post.likes = post.likes.filter(like => like.toString() !== userId);
      }
    }

    await post.save();

    return res.json({
      success: true,
      data: {
        likes: post.likes.length,
        dislikes: post.dislikes.length,
        hasLiked: false,
        hasDisliked: !hasDisliked
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al procesar dislike',
      error: error.message
    });
  }
};

// Reportar un post
export const reportPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const { reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'La razón del reporte es requerida'
      });
    }

    const post = await ForumPost.findById(id);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Verificar si el usuario ya reportó este post
    const existingReport = post.reports.find(report => 
      report.reportedBy.toString() === userId && report.status === 'pending'
    );

    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: 'Ya has reportado este post'
      });
    }

    post.reports.push({
      reportedBy: userId,
      reason,
      description,
      status: 'pending',
      createdAt: new Date()
    });

    // Si hay muchos reportes, marcar como flagged
    const pendingReports = post.reports.filter(r => r.status === 'pending').length;
    if (pendingReports >= 3) {
      post.moderationStatus = 'flagged';
    }

    await post.save();

    return res.json({
      success: true,
      message: 'Post reportado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al reportar el post',
      error: error.message
    });
  }
};

// Editar un post (solo autor)
export const editPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const { title, content, reason } = req.body;

    const post = await ForumPost.findById(id);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Solo el autor puede editar
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes editar tus propios posts'
      });
    }

    // Verificar si el post está bloqueado
    if (post.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'Este post está bloqueado y no se puede editar'
      });
    }

    // Guardar en historial
    post.editHistory.push({
      editedBy: userId,
      previousContent: post.content,
      reason,
      editedAt: new Date()
    });

    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();

    return res.json({
      success: true,
      data: post,
      message: 'Post editado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al editar el post',
      error: error.message
    });
  }
};

// Eliminar un post (solo autor o moderadores)
export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const { id } = req.params;

    const post = await ForumPost.findById(id).populate('forum');
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    const isAuthor = post.author.toString() === userId;
    const isModerator = (post.forum as any).moderators.includes(userId);
    const isAdmin = userRole === 'admin';

    if (!isAuthor && !isModerator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este post'
      });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

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
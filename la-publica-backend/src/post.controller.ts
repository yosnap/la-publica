import { Request, Response } from 'express';
import Post from './post.model';
import User from './user.model';

// Crear un nuevo post
export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { content, image, mood, targetUserId } = req.body;

    console.log('🔄 CREATING POST - Received data:', { content: content?.slice(0, 30), image, mood, targetUserId }); // Debug

    if (!content) {
      return res.status(400).json({ success: false, message: 'El contingut és requerit' });
    }

    // Si hay targetUserId, verificar que el usuario objetivo existe
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'Usuari objectiu no trobat' });
      }
    }

    const postDataToSave = {
      content,
      author: userId,
      ...(image && { image }),
      ...(mood && { mood }),
      ...(targetUserId && { targetUser: targetUserId })
    };
    
    console.log('💾 SAVING POST with data:', postDataToSave);
    
    const post = new Post(postDataToSave);
    await post.save();
    
    console.log('✅ POST SAVED with ID:', post._id, 'targetUser:', post.targetUser);
    
    // Poblar el autor y targetUser para devolverlo en la respuesta
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('targetUser', 'username firstName lastName profilePicture');

    return res.status(201).json({
      success: true,
      data: populatedPost,
      message: 'Publicació creada exitosament'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en crear la publicació', error: error.message });
  }
};

// Listar todos los posts
export const listPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username firstName lastName profilePicture') // Poblar datos del autor
      .populate('targetUser', 'username firstName lastName profilePicture') // Poblar usuario objetivo
      .sort({ createdAt: -1 }); // Ordenar por más reciente

    console.log('📋 LISTING POSTS - Total found:', posts.length);
    const recentPosts = posts.slice(0, 3);
    recentPosts.forEach((post, i) => {
      const postId = post._id ? post._id.toString().slice(-6) : 'unknown';
      const authorName = (post.author as any)?.firstName || 'Unknown';
      const targetName = (post.targetUser as any)?.firstName || 'Feed';
      console.log(`${i+1}. ${postId} - ${authorName} → ${targetName}`);
    });

    return res.json({
      success: true,
      data: posts
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en llistar les publicacions', error: error.message });
  }
};

// Ver un post por ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('targetUser', 'username firstName lastName profilePicture')
      .populate('comments.author', 'username firstName lastName profilePicture'); // Poblar autores de comentarios

    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicació no trobada' });
    }

    return res.json({
      success: true,
      data: post
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en buscar la publicació', error: error.message });
  }
};

// Editar un post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicació no trobada' });
    }

    // Verificar si el usuario es el autor del post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'No tens permisos per editar aquesta publicació' });
    }

    post.content = content;
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('targetUser', 'username firstName lastName profilePicture');


    return res.json({
      success: true,
      data: populatedPost,
      message: 'Publicació actualitzada'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en actualitzar la publicació', error: error.message });
  }
};

// Eliminar un post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const postId = req.params.id;
    
    console.log(`🗑️ DELETE POST - User: ${userId}, Role: ${userRole}, PostID: ${postId}`);
    
    const post = await Post.findById(postId);

    if (!post) {
      console.log(`❌ POST NOT FOUND: ${postId}`);
      return res.status(404).json({ success: false, message: 'Publicació no trobada' });
    }

    console.log(`🔍 POST FOUND - Author: ${post.author}, Checking permissions...`);

    // Verificar si el usuario es el autor o un admin
    if (post.author.toString() !== userId && userRole !== 'admin') {
      console.log(`🚫 PERMISSION DENIED - Author: ${post.author}, User: ${userId}, Role: ${userRole}`);
      return res.status(403).json({ success: false, message: 'No tens permisos per eliminar aquesta publicació' });
    }

    console.log(`✅ PERMISSION GRANTED - Deleting post ${postId}...`);
    await post.deleteOne();
    console.log(`✓ POST DELETED SUCCESSFULLY: ${postId}`);

    return res.json({
      success: true,
      message: 'Publicació eliminada',
      data: { id: postId }
    });
  } catch (error: any) {
    console.error(`🔴 ERROR DELETING POST:`, error);
    return res.status(500).json({ success: false, message: 'Error en eliminar la publicació', error: error.message });
  }
};

// Dar/quitar like a un post
export const likePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicació no trobada' });
    }

    // Verificar si el usuario ya dio like
    const index = post.likes.findIndex(id => id.toString() === userId);

    if (index > -1) {
      // Si ya dio like, quitarlo
      post.likes.splice(index, 1);
    } else {
      // Si no, agregarlo
      post.likes.push(userId);
    }

    await post.save();
    
    // Devolver el post actualizado
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('targetUser', 'username firstName lastName profilePicture')
      .populate('comments.author', 'username firstName lastName profilePicture');

    return res.json({
      success: true,
      data: populatedPost,
      message: 'M\'agrada actualitzat'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en donar m\'agrada', error: error.message });
  }
};

// Comentar un post
export const commentOnPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicació no trobada' });
    }

    if (post.commentsDisabled) {
      return res.status(403).json({ success: false, message: 'Els comentaris estan desactivats per a aquesta publicació' });
    }

    if (!text) {
      return res.status(400).json({ success: false, message: 'El text del comentari és requerit' });
    }

    const comment = {
      author: userId,
      text: text
    };

    post.comments.push(comment as any); // Hacemos cast a any para evitar problemas con el tipo
    await post.save();
    
    // Devolver el post actualizado
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('targetUser', 'username firstName lastName profilePicture')
      .populate('comments.author', 'username firstName lastName profilePicture');

    return res.json({
      success: true,
      data: populatedPost,
      message: 'Comentari afegit'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en comentar la publicació', error: error.message });
  }
};

// Obtener el feed de actividad para el usuario logueado
export const getUserFeed = async (req: Request, res: Response) => {
  const currentUserId = (req as any).user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    // Obtener TODOS los posts, no solo de usuarios seguidos
    const posts = await Post.find({})
      .sort({ pinned: -1, createdAt: -1 }) // Posts fijados primero, luego por fecha
      .skip(skip)
      .limit(limit)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('targetUser', 'username firstName lastName profilePicture')
      .populate('pinnedBy', 'username firstName lastName')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username firstName lastName profilePicture'
        }
      });
    
    // Filtrar posts que no tienen autor (usuarios eliminados)
    const validPosts = posts.filter(post => post.author !== null);
      
    const totalPosts = await Post.countDocuments({});

    return res.status(200).json({
      success: true,
      data: validPosts,
      pagination: {
        total: totalPosts,
        page,
        limit,
        totalPages: Math.ceil(totalPosts / limit)
      }
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en obtenir el feed', error: error.message });
  }
};

// Desactivar/activar comentarios en un post (solo admin/moderador)
export const toggleComments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicació no trobada' });
    }

    // Verificar permisos: solo admin, moderador o el autor del post
    if (userRole !== 'admin' && userRole !== 'moderator' && post.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'No tens permisos per a aquesta acció' });
    }

    post.commentsDisabled = !post.commentsDisabled;
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('targetUser', 'username firstName lastName profilePicture')
      .populate('comments.author', 'username firstName lastName profilePicture');

    return res.json({
      success: true,
      data: populatedPost,
      message: post.commentsDisabled ? 'Comentaris desactivats' : 'Comentaris activats'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en canviar estat de comentaris', error: error.message });
  }
};

// Fijar/desfijar post en el feed (solo admin/moderador)
export const togglePinPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicació no trobada' });
    }

    // Verificar permisos: solo admin o moderador
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return res.status(403).json({ success: false, message: 'No tens permisos per a aquesta acció' });
    }

    post.pinned = !post.pinned;
    if (post.pinned) {
      post.pinnedBy = userId;
      post.pinnedAt = new Date();
    } else {
      post.pinnedBy = undefined;
      post.pinnedAt = undefined;
    }
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('targetUser', 'username firstName lastName profilePicture')
      .populate('pinnedBy', 'username firstName lastName')
      .populate('comments.author', 'username firstName lastName profilePicture');

    return res.json({
      success: true,
      data: populatedPost,
      message: post.pinned ? 'Publicació fixada al feed' : 'Publicació disfixada del feed'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en fixar/disfixar publicació', error: error.message });
  }
}; 
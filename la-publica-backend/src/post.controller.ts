import { Request, Response } from 'express';
import Post from './post.model';
import User from './user.model';

// Crear un nuevo post
export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { content, image, mood } = req.body;

    console.log('Received post data:', { content, image, mood }); // Debug

    if (!content) {
      return res.status(400).json({ success: false, message: 'El contenido es requerido' });
    }

    const post = new Post({
      content,
      author: userId,
      ...(image && { image }),
      ...(mood && { mood })
    });
    await post.save();
    
    // Poblar el autor para devolverlo en la respuesta
    const populatedPost = await Post.findById(post._id).populate('author', 'username firstName lastName profilePicture');

    return res.status(201).json({
      success: true,
      data: populatedPost,
      message: 'Post creado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al crear el post', error: error.message });
  }
};

// Listar todos los posts
export const listPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username firstName lastName profilePicture') // Poblar datos del autor
      .sort({ createdAt: -1 }); // Ordenar por más reciente

    return res.json({
      success: true,
      data: posts
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al listar los posts', error: error.message });
  }
};

// Ver un post por ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('comments.author', 'username firstName lastName profilePicture'); // Poblar autores de comentarios

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post no encontrado' });
    }

    return res.json({
      success: true,
      data: post
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al buscar el post', error: error.message });
  }
};

// Editar un post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post no encontrado' });
    }

    // Verificar si el usuario es el autor del post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para editar este post' });
    }

    post.content = content;
    await post.save();
    
    const populatedPost = await Post.findById(post._id).populate('author', 'username firstName lastName profilePicture');


    return res.json({
      success: true,
      data: populatedPost,
      message: 'Post actualizado'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al actualizar el post', error: error.message });
  }
};

// Eliminar un post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post no encontrado' });
    }

    // Verificar si el usuario es el autor o un admin
    if (post.author.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'No tienes permisos para eliminar este post' });
    }

    await post.deleteOne();

    return res.json({
      success: true,
      message: 'Post eliminado'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al eliminar el post', error: error.message });
  }
};

// Dar/quitar like a un post
export const likePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post no encontrado' });
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
      .populate('comments.author', 'username firstName lastName profilePicture');

    return res.json({
      success: true,
      data: populatedPost,
      message: 'Like actualizado'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al dar like', error: error.message });
  }
};

// Comentar un post
export const commentOnPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post no encontrado' });
    }

    if (post.commentsDisabled) {
      return res.status(403).json({ success: false, message: 'Los comentarios están desactivados para este post' });
    }

    if (!text) {
      return res.status(400).json({ success: false, message: 'El texto del comentario es requerido' });
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
      .populate('comments.author', 'username firstName lastName profilePicture');

    return res.json({
      success: true,
      data: populatedPost,
      message: 'Comentario agregado'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al comentar el post', error: error.message });
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
    return res.status(500).json({ success: false, message: 'Error al obtener el feed', error: error.message });
  }
};

// Desactivar/activar comentarios en un post (solo admin/moderador)
export const toggleComments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post no encontrado' });
    }

    // Verificar permisos: solo admin, moderador o el autor del post
    if (userRole !== 'admin' && userRole !== 'moderator' && post.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para esta acción' });
    }

    post.commentsDisabled = !post.commentsDisabled;
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('comments.author', 'username firstName lastName profilePicture');

    return res.json({
      success: true,
      data: populatedPost,
      message: post.commentsDisabled ? 'Comentarios desactivados' : 'Comentarios activados'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al cambiar estado de comentarios', error: error.message });
  }
};

// Fijar/desfijar post en el feed (solo admin/moderador)
export const togglePinPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post no encontrado' });
    }

    // Verificar permisos: solo admin o moderador
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return res.status(403).json({ success: false, message: 'No tienes permisos para esta acción' });
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
      .populate('pinnedBy', 'username firstName lastName')
      .populate('comments.author', 'username firstName lastName profilePicture');

    return res.json({
      success: true,
      data: populatedPost,
      message: post.pinned ? 'Post fijado en el feed' : 'Post desfijado del feed'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al fijar/desfijar post', error: error.message });
  }
}; 
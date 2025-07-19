import { Request, Response } from 'express';
import Blog from './blog.model';
import Category from './category.model';
import { createLog } from './system.controller';

// Función para generar slug único
const generateUniqueSlug = async (title: string, excludeId?: string): Promise<string> => {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[àáâäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query: any = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existingBlog = await Blog.findOne(query);
    if (!existingBlog) {
      break;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Obtener todos los blogs
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      tag,
      search,
      status = 'published',
      featured,
      sort = '-publishedAt'
    } = req.query;

    const query: any = {};

    // Filtro por estado
    if (status) {
      query.status = status;
    }

    // Filtro por categoría
    if (category) {
      query.category = category;
    }

    // Filtro por tag
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Filtro por featured
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    // Búsqueda por texto
    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'firstName lastName profilePicture')
        .populate('category', 'name color icon')
        .sort(sort as string)
        .skip(skip)
        .limit(Number(limit)),
      Blog.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    await createLog('error', 'Error al obtener blogs', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener blogs',
      error: error.message
    });
  }
};

// Obtener un blog por slug
export const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: 'published' })
      .populate('author', 'firstName lastName profilePicture bio')
      .populate('category', 'name color icon');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog no encontrado'
      });
    }

    // Incrementar contador de vistas
    blog.viewCount += 1;
    await blog.save();

    // Obtener blogs relacionados
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } }
      ],
      status: 'published'
    })
      .populate('author', 'firstName lastName profilePicture')
      .populate('category', 'name color icon')
      .sort('-publishedAt')
      .limit(3);

    return res.json({
      success: true,
      data: {
        blog,
        related: relatedBlogs
      }
    });
  } catch (error: any) {
    await createLog('error', 'Error al obtener blog por slug', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener blog',
      error: error.message
    });
  }
};

// Obtener un blog por ID (para edición)
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    const blog = await Blog.findById(id)
      .populate('author', 'firstName lastName profilePicture bio')
      .populate('category', 'name color icon');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog no encontrado'
      });
    }

    // Solo el autor, admin o editor pueden acceder al blog para edición
    const canEdit = (
      blog.author._id.toString() === userId ||
      userRole === 'admin' ||
      userRole === 'editor'
    );

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este blog'
      });
    }

    return res.json({
      success: true,
      data: blog
    });
  } catch (error: any) {
    await createLog('error', 'Error al obtener blog por ID', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener blog',
      error: error.message
    });
  }
};

// Crear un nuevo blog
export const createBlog = async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      excerpt,
      tags,
      category,
      coverImage,
      status = 'draft',
      featured = false,
      metaDescription,
      metaKeywords
    } = req.body;

    // Verificar que la categoría existe y es de tipo blog
    const blogCategory = await Category.findOne({ _id: category, type: 'blog' });
    if (!blogCategory) {
      return res.status(400).json({
        success: false,
        message: 'Categoría de blog inválida'
      });
    }

    // Generar slug único
    const slug = await generateUniqueSlug(title);

    const blog = new Blog({
      title,
      slug,
      content,
      excerpt,
      tags: tags || [],
      category,
      author: (req as any).user.userId,
      coverImage,
      status,
      featured,
      metaDescription,
      metaKeywords: metaKeywords || []
    });

    await blog.save();

    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'firstName lastName profilePicture')
      .populate('category', 'name color icon');

    await createLog('info', `Blog creado: ${title}`, {
      blogId: blog._id,
      author: (req as any).user.userId
    });

    return res.status(201).json({
      success: true,
      message: 'Blog creado exitosamente',
      data: populatedBlog
    });
  } catch (error: any) {
    await createLog('error', 'Error al crear blog', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear blog',
      error: error.message
    });
  }
};

// Actualizar un blog
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      tags,
      category,
      coverImage,
      status,
      featured,
      metaDescription,
      metaKeywords
    } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog no encontrado'
      });
    }

    // Verificar permisos (solo el autor o admin/editor pueden editar)
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;
    
    if (blog.author.toString() !== userId && !['admin', 'editor'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este blog'
      });
    }

    // Si se cambió el título, generar nuevo slug
    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = await generateUniqueSlug(title, id);
    }

    // Verificar categoría si se cambió
    if (category && category !== blog.category.toString()) {
      const blogCategory = await Category.findOne({ _id: category, type: 'blog' });
      if (!blogCategory) {
        return res.status(400).json({
          success: false,
          message: 'Categoría de blog inválida'
        });
      }
    }

    const updateData = {
      ...(title && { title }),
      ...(title && { slug }),
      ...(content && { content }),
      ...(excerpt && { excerpt }),
      ...(tags !== undefined && { tags }),
      ...(category && { category }),
      ...(coverImage !== undefined && { coverImage }),
      ...(status && { status }),
      ...(featured !== undefined && { featured }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(metaKeywords !== undefined && { metaKeywords })
    };

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('author', 'firstName lastName profilePicture')
      .populate('category', 'name color icon');

    await createLog('info', `Blog actualizado: ${updatedBlog?.title}`, {
      blogId: id,
      updatedBy: userId
    });

    return res.json({
      success: true,
      message: 'Blog actualizado exitosamente',
      data: updatedBlog
    });
  } catch (error: any) {
    await createLog('error', 'Error al actualizar blog', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar blog',
      error: error.message
    });
  }
};

// Eliminar un blog
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog no encontrado'
      });
    }

    // Verificar permisos (solo el autor o admin/editor pueden eliminar)
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;
    
    if (blog.author.toString() !== userId && !['admin', 'editor'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este blog'
      });
    }

    await Blog.findByIdAndDelete(id);

    await createLog('info', `Blog eliminado: ${blog.title}`, {
      blogId: id,
      deletedBy: userId
    });

    return res.json({
      success: true,
      message: 'Blog eliminado exitosamente'
    });
  } catch (error: any) {
    await createLog('error', 'Error al eliminar blog', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar blog',
      error: error.message
    });
  }
};

// Obtener blogs del usuario actual
export const getMyBlogs = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      status,
      sort = '-updatedAt'
    } = req.query;

    const query: any = {
      author: (req as any).user.userId
    };

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('category', 'name color icon')
        .sort(sort as string)
        .skip(skip)
        .limit(Number(limit)),
      Blog.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    await createLog('error', 'Error al obtener mis blogs', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener blogs',
      error: error.message
    });
  }
};

// Obtener estadísticas de blogs
export const getBlogStats = async (req: Request, res: Response) => {
  try {
    const [
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      featuredBlogs,
      totalViews,
      categoriesWithCount
    ] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Blog.countDocuments({ featured: true }),
      Blog.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
      ]),
      Blog.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { name: '$category.name', count: 1 } },
        { $sort: { count: -1 } }
      ])
    ]);

    return res.json({
      success: true,
      data: {
        total: totalBlogs,
        published: publishedBlogs,
        draft: draftBlogs,
        featured: featuredBlogs,
        totalViews: totalViews[0]?.totalViews || 0,
        categoriesWithCount
      }
    });
  } catch (error: any) {
    await createLog('error', 'Error al obtener estadísticas de blogs', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Obtener tags populares
export const getPopularTags = async (req: Request, res: Response) => {
  try {
    const popularTags = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);

    return res.json({
      success: true,
      data: popularTags
    });
  } catch (error: any) {
    await createLog('error', 'Error al obtener tags populares', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tags',
      error: error.message
    });
  }
};
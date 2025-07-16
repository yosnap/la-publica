import { Request, Response } from 'express';
import ForumPost from './forumPost.model';
import Forum from './forum.model';
import mongoose from 'mongoose';

// Obtener posts pendientes de moderación (solo admin/moderadores)
export const getPendingPosts = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden acceder a la moderación'
      });
    }

    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    
    if (status === 'pending') {
      query.moderationStatus = 'pending';
    } else if (status === 'flagged') {
      query.moderationStatus = 'flagged';
    } else if (status === 'reported') {
      query['reports.status'] = 'pending';
    }

    const posts = await ForumPost.find(query)
      .populate('author', 'firstName lastName profilePhoto')
      .populate('forum', 'name category')
      .populate('forum.category', 'name color')
      .populate('reports.reportedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
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
      message: 'Error al obtener posts pendientes',
      error: error.message
    });
  }
};

// Obtener reportes pendientes (solo admin/moderadores)
export const getReports = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden ver reportes'
      });
    }

    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const posts = await ForumPost.find({
      'reports.status': status
    })
      .populate('author', 'firstName lastName profilePhoto')
      .populate('forum', 'name')
      .populate('reports.reportedBy', 'firstName lastName')
      .sort({ 'reports.createdAt': -1 })
      .skip(skip)
      .limit(Number(limit));

    // Filtrar solo los reportes con el estado solicitado
    const postsWithFilteredReports = posts.map(post => ({
      ...post.toObject(),
      reports: post.reports.filter(report => report.status === status)
    }));

    const total = await ForumPost.countDocuments({
      'reports.status': status
    });

    return res.json({
      success: true,
      data: postsWithFilteredReports,
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
      message: 'Error al obtener reportes',
      error: error.message
    });
  }
};

// Aprobar un post (solo admin/moderadores)
export const approvePost = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden aprobar posts'
      });
    }

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    post.moderationStatus = 'approved';
    post.isApproved = true;
    post.moderatedBy = userId;
    await post.save();

    return res.json({
      success: true,
      message: 'Post aprobado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al aprobar el post',
      error: error.message
    });
  }
};

// Rechazar un post (solo admin/moderadores)
export const rejectPost = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const { reason } = req.body;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden rechazar posts'
      });
    }

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    post.moderationStatus = 'rejected';
    post.isApproved = false;
    post.isActive = false; // Ocultar el post
    post.moderatedBy = userId;
    post.moderationReason = reason;
    await post.save();

    return res.json({
      success: true,
      message: 'Post rechazado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al rechazar el post',
      error: error.message
    });
  }
};

// Resolver un reporte (solo admin/moderadores)
export const resolveReport = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    const { postId, reportId } = req.params;
    const { action, reason } = req.body; // action: 'resolve' | 'dismiss'

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden resolver reportes'
      });
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    const report = post.reports.find(r => r._id?.toString() === reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    if (action === 'resolve') {
      // Resolver el reporte y tomar acción en el post
      report.status = 'resolved';
      report.resolvedBy = userId;
      
      // Si se resuelve, también marcar el post como rechazado
      post.moderationStatus = 'rejected';
      post.isApproved = false;
      post.isActive = false;
      post.moderatedBy = userId;
      post.moderationReason = reason || 'Contenido reportado y removido';
    } else if (action === 'dismiss') {
      // Descartar el reporte sin acción
      report.status = 'dismissed';
      report.resolvedBy = userId;
    }

    await post.save();

    return res.json({
      success: true,
      message: action === 'resolve' ? 'Reporte resuelto y post removido' : 'Reporte descartado'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al resolver el reporte',
      error: error.message
    });
  }
};

// Fijar/desfijar un post (solo admin/moderadores del foro)
export const togglePinPost = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden fijar posts'
      });
    }

    const post = await ForumPost.findById(id).populate('forum');
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    return res.json({
      success: true,
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

// Bloquear/desbloquear un post (solo admin/moderadores del foro)
export const toggleLockPost = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden bloquear posts'
      });
    }

    const post = await ForumPost.findById(id).populate('forum');
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    post.isLocked = !post.isLocked;
    await post.save();

    return res.json({
      success: true,
      message: post.isLocked ? 'Post bloqueado exitosamente' : 'Post desbloqueado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de bloqueo',
      error: error.message
    });
  }
};

// Obtener estadísticas de moderación (solo admin)
export const getModerationStats = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden ver estadísticas'
      });
    }

    const [
      totalPosts,
      pendingPosts,
      flaggedPosts,
      rejectedPosts,
      totalReports,
      pendingReports,
      activeForums
    ] = await Promise.all([
      ForumPost.countDocuments({ isActive: true }),
      ForumPost.countDocuments({ moderationStatus: 'pending' }),
      ForumPost.countDocuments({ moderationStatus: 'flagged' }),
      ForumPost.countDocuments({ moderationStatus: 'rejected' }),
      ForumPost.aggregate([
        { $unwind: '$reports' },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]),
      ForumPost.aggregate([
        { $unwind: '$reports' },
        { $match: { 'reports.status': 'pending' } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]),
      Forum.countDocuments({ isActive: true })
    ]);

    return res.json({
      success: true,
      data: {
        totalPosts,
        pendingPosts,
        flaggedPosts,
        rejectedPosts,
        totalReports: totalReports[0]?.count || 0,
        pendingReports: pendingReports[0]?.count || 0,
        activeForums
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};
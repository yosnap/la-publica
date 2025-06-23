import { Request, Response, NextFunction } from 'express';
import User from './user.model';
import { validate, updateProfileSchema } from './utils/validation';

// Listar todos los usuarios
export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, '-password'); // Excluir contraseña
    return res.json({
      success: true,
      data: users
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al listar usuarios',
      error: error.message
    });
  }
};

// Ver usuario por ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    return res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al buscar usuario',
      error: error.message
    });
  }
};

// Editar perfil del usuario autenticado
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Suponemos que el ID del usuario autenticado está en req.user.userId
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }
    const data = validate(updateProfileSchema, req.body);
    const user = await User.findByIdAndUpdate(userId, data, { new: true, select: '-password' });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    return res.json({
      success: true,
      data: user,
      message: 'Perfil actualizado'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

// Eliminar usuario por ID
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    return res.status(200).json({ success: true, message: 'Usuario eliminado' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al eliminar usuario', error: error.message });
  }
};

// Seguir/Dejar de seguir a un usuario
export const followOrUnfollowUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userToFollowId = req.params.id;
    const currentUserId = (req as any).user?.userId;

    if (userToFollowId === currentUserId) {
      return res.status(400).json({ success: false, message: 'No puedes seguirte a ti mismo' });
    }

    const userToFollow = await User.findById(userToFollowId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const isFollowing = currentUser.following.some(id => id.toString() === userToFollowId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollowId);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUserId);
    } else {
      currentUser.following.push(userToFollowId as any);
      userToFollow.followers.push(currentUserId as any);
    }

    await Promise.all([currentUser.save(), userToFollow.save()]);

    return res.status(200).json({
      success: true,
      message: isFollowing ? 'Dejaste de seguir al usuario' : 'Ahora sigues al usuario'
    });
  } catch (error) {
    return next(error);
  }
};

// Obtener la lista de seguidores de un usuario
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username firstName lastName'); // Popula para obtener detalles

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ success: true, data: user.followers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al obtener seguidores', error: error.message });
  }
};

// Obtener la lista de usuarios a los que sigue un usuario
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username firstName lastName'); // Popula para obtener detalles

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ success: true, data: user.following });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al obtener seguidos', error: error.message });
  }
};

/**
 * Obtiene el perfil del usuario actualmente autenticado.
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
}; 
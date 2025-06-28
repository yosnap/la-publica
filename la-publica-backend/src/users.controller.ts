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
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    // Validar y transformar los datos usando el esquema
    const data = validate(updateProfileSchema, req.body);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Separar los campos sociales de los demás
    const { socialLinks, ...otherFields } = data;

    // Actualizar los campos del nivel superior
    // Solo actualizar birthDate si está presente en otherFields
    if (Object.prototype.hasOwnProperty.call(otherFields, 'birthDate')) {
      // @ts-expect-error: birthDate puede ser agregado dinámicamente por el esquema de validación
      user.birthDate = otherFields.birthDate;
    }
    // Actualizar el resto de campos excepto birthDate
    Object.entries(otherFields).forEach(([key, value]) => {
      if (key !== 'birthDate') {
        (user as any)[key] = value;
      }
    });

    // Actualizar los campos sociales anidados, asegurando que el objeto social exista
    if (socialLinks) {
      if (!user.socialLinks) {
        user.socialLinks = { facebook: '', twitter: '', youtube: '' };
      }
      const allowedSocialKeys = ['facebook', 'twitter', 'youtube'] as const;
      for (const key of allowedSocialKeys) {
        const value = socialLinks[key];
        if (typeof value === 'string' && value.trim() === '') {
          // Si es string vacío, borrar el campo
          user.socialLinks[key] = undefined;
        } else if (value === null) {
          // Si es null, borrar el campo
          user.socialLinks[key] = undefined;
        } else if (value !== undefined) {
          user.socialLinks[key] = value;
        }
        // Si value es undefined, no modificar el valor existente
      }
    }

    const updatedUser = await user.save();
    const userObject: any = updatedUser.toObject();
    delete userObject.password;

    return res.json({
      success: true,
      data: userObject,
      message: 'Perfil actualizado'
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Error de validación', error: error.message });
    }
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

    // Log temporal para debug
    console.log('🔍 Datos del usuario devueltos:', {
      id: user._id,
      firstName: user.firstName,
      birthDate: user.birthDate,
      birthDateType: typeof user.birthDate
    });

    console.log(' '); // Agregar un espacio para forzar el reinicio del servidor

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
}; 
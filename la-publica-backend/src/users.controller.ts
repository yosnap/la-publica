import { Request, Response, NextFunction } from 'express';
import User from './user.model';
import { validate, updateProfileSchema } from './utils/validation';
import { JWTService } from './utils/jwt';

// Listar todos los usuarios
export const listUsers = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'newest'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'active':
        sort = { lastActive: -1, createdAt: -1 };
        break;
      case 'popular':
        sort = { 'followers.length': -1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const users = await User.find(filter, '-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await User.countDocuments(filter);

    return res.json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error en llistar usuaris',
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
        message: 'Usuari no trobat'
      });
    }
    return res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error en buscar usuari',
      error: error.message
    });
  }
};

// Ver usuario por slug
export const getUserBySlug = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ slug: req.params.slug }, '-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuari no trobat'
      });
    }
    return res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error en buscar usuari',
      error: error.message
    });
  }
};

// Editar perfil del usuario autenticado
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    // Validar y transformar los datos usando el esquema
    const data = validate(updateProfileSchema, req.body);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuari no trobat' });
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
      message: 'Perfil actualitzat'
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Error de validació', error: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Error en actualitzar perfil',
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
        message: 'Usuari no trobat'
      });
    }
    return res.status(200).json({ success: true, message: 'Usuari eliminat' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en eliminar usuari', error: error.message });
  }
};

// Seguir/Dejar de seguir a un usuario
export const followOrUnfollowUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userToFollowId = req.params.id;
    const currentUserId = (req as any).user?.userId;

    if (userToFollowId === currentUserId) {
      return res.status(400).json({ success: false, message: 'No pots seguir-te a tu mateix' });
    }

    const userToFollow = await User.findById(userToFollowId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ success: false, message: 'Usuari no trobat' });
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
      message: isFollowing ? 'Has deixat de seguir l\'usuari' : 'Ara segueixes l\'usuari'
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
      return res.status(404).json({ success: false, message: 'Usuari no trobat' });
    }

    return res.status(200).json({ success: true, data: user.followers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en obtenir seguidors', error: error.message });
  }
};

// Obtener la lista de usuarios a los que sigue un usuario
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username firstName lastName'); // Popula para obtener detalles

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuari no trobat' });
    }

    return res.status(200).json({ success: true, data: user.following });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en obtenir seguits', error: error.message });
  }
};

/**
 * Obtiene el perfil del usuario actualmente autenticado.
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuari no trobat' });
    }

    // Log temporal para debug
    console.log('🔍 Datos del usuario devueltos:', {
      id: user._id,
      firstName: user.firstName,
      email: user.email,
      role: user.role,
      birthDate: user.birthDate,
      birthDateType: typeof user.birthDate
    });

    console.log(' '); // Agregar un espacio para forzar el reinicio del servidor

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

/**
 * Debug endpoint para verificar token (solo desarrollo)
 */
export const checkToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = JWTService.decodeToken(token);
    
    if (!decoded || !decoded.exp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeLeft = expirationTime - currentTime;
    const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    res.json({
      success: true,
      data: {
        tokenValid: timeLeft > 0,
        expiresAt: new Date(expirationTime).toISOString(),
        currentTime: new Date(currentTime).toISOString(),
        timeLeft: {
          total: timeLeft,
          days: daysLeft,
          hours: hoursLeft,
          minutes: minutesLeft
        },
        user: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error checking token',
      error: error.message
    });
  }
}; 
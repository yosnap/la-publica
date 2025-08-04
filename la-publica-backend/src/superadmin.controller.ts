import { Request, Response, NextFunction } from 'express';
import User from './user.model';
import { PasswordService } from './utils/helpers';
import { AuthenticatedRequest } from './types';

// Obtener todos los usuarios con paginación
export const getAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const role = req.query.role as string || '';

    const skip = (page - 1) * limit;

    // Construir filtro de búsqueda
    const filter: any = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    return next(error);
  }
};

// Crear nuevo usuario
export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, username, password, role = 'user' } = req.body;

    // Validar datos requeridos
    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tots els camps són obligatoris'
      });
    }

    // Verificar si ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Ja existeix un usuari amb aquest email o nom d\'usuari'
      });
    }

    // Hashear contraseña
    const hashedPassword = await PasswordService.hashPassword(password);

    // Crear usuario
    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      role,
      isActive: true,
      isEmailVerified: true
    });

    await newUser.save();

    // Devolver usuario sin contraseña
    const userResponse = await User.findById(newUser._id).select('-password');

    return res.status(201).json({
      success: true,
      message: 'Usuari creat exitosament',
      data: userResponse
    });

  } catch (error) {
    return next(error);
  }
};

// Actualizar usuario
export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // No permitir actualizar password directamente
    if (updates.password) {
      delete updates.password;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuari no trobat'
      });
    }

    return res.json({
      success: true,
      message: 'Usuari actualitzat exitosament',
      data: user
    });

  } catch (error) {
    return next(error);
  }
};

// Cambiar contraseña de usuario
export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'La nova contrasenya és obligatòria'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contrasenya ha de tenir almenys 8 caràcters'
      });
    }

    const hashedPassword = await PasswordService.hashPassword(newPassword);

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { password: hashedPassword } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuari no trobat'
      });
    }

    return res.json({
      success: true,
      message: 'Contrasenya canviada exitosament'
    });

  } catch (error) {
    return next(error);
  }
};

// Cambiar rol de usuario
export const changeRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'admin', 'colaborador', 'editor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol no vàlid'
      });
    }

    // No permitir cambiar el rol de superadmin
    const currentUser = await User.findById(id);
    if (currentUser?.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'No es pot canviar el rol de superadmin'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuari no trobat'
      });
    }

    return res.json({
      success: true,
      message: 'Rol canviat exitosament',
      data: user
    });

  } catch (error) {
    return next(error);
  }
};

// Activar/Desactivar usuario
export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // No permitir desactivar superadmin
    const currentUser = await User.findById(id);
    if (currentUser?.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'No es pot desactivar el superadmin'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      [{ $set: { isActive: { $not: '$isActive' } } }],
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuari no trobat'
      });
    }

    return res.json({
      success: true,
      message: user.isActive ? 'Usuari activat' : 'Usuari desactivat',
      data: user
    });

  } catch (error) {
    return next(error);
  }
};

// Eliminar usuario
export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // No permitir eliminar superadmin
    const currentUser = await User.findById(id);
    if (currentUser?.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'No es pot eliminar el superadmin'
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuari no trobat'
      });
    }

    return res.json({
      success: true,
      message: 'Usuari eliminat exitosament'
    });

  } catch (error) {
    return next(error);
  }
};

// Obtener estadísticas de usuarios
export const getUserStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersByRole,
        recentUsers
      }
    });

  } catch (error) {
    return next(error);
  }
};
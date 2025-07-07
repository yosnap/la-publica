import { Request, Response } from 'express';
import Group from './group.model';
import User from './user.model';
import GroupCategory from './groupCategory.model';

// Crear un nuevo grupo
export const createGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { name, description, category, privacy, tags, rules, location, website, image, coverImage } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, descripción y categoría son requeridos' 
      });
    }

    // Verificar que la categoría existe y está activa
    const categoryExists = await GroupCategory.findOne({ _id: category, isActive: true });
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'La categoría seleccionada no existe o no está activa'
      });
    }

    // Verificar que no exista un grupo con el mismo nombre
    const existingGroup = await Group.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingGroup) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un grupo con ese nombre'
      });
    }

    const group = new Group({
      name,
      description,
      category,
      privacy: privacy || 'public',
      creator: userId,
      tags: tags || [],
      rules: rules || [],
      location,
      website,
      image,
      coverImage,
      members: [{
        user: userId,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    await group.save();
    
    const populatedGroup = await Group.findById(group._id)
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('members.user', 'username firstName lastName profilePicture')
      .populate('category', 'name description color icon');

    return res.status(201).json({
      success: true,
      data: populatedGroup,
      message: 'Grupo creado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al crear el grupo', 
      error: error.message 
    });
  }
};

// Listar todos los grupos (públicos)
export const listGroups = async (req: Request, res: Response) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query: any = { isActive: true, privacy: 'public' };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const groups = await Group.find(query)
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('category', 'name description color icon')
      .sort({ memberCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Group.countDocuments(query);

    return res.json({
      success: true,
      data: groups,
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
      message: 'Error al listar los grupos', 
      error: error.message 
    });
  }
};

// Obtener grupos del usuario (donde es miembro)
export const getUserGroups = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    const groups = await Group.find({
      'members.user': userId,
      isActive: true
    })
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('members.user', 'username firstName lastName profilePicture')
      .populate('category', 'name description color icon')
      .sort({ createdAt: -1 });

    // Añadir el rol del usuario en cada grupo
    const groupsWithRole = groups.map(group => {
      const member = group.members.find(m => m.user._id.toString() === userId);
      return {
        ...group.toObject(),
        userRole: member?.role || 'member'
      };
    });

    return res.json({
      success: true,
      data: groupsWithRole
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al obtener los grupos del usuario', 
      error: error.message 
    });
  }
};

// Obtener un grupo por ID
export const getGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const group = await Group.findById(id)
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('members.user', 'username firstName lastName profilePicture')
      .populate('category', 'name description color icon');

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grupo no encontrado' 
      });
    }

    // Verificar si el grupo es privado y el usuario no es miembro
    if (group.privacy === 'private') {
      const isMember = group.members.some(member => member.user._id.toString() === userId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este grupo privado'
        });
      }
    }

    // Añadir el rol del usuario si es miembro
    let userRole = null;
    const member = group.members.find(m => m.user._id.toString() === userId);
    if (member) {
      userRole = member.role;
    }

    return res.json({
      success: true,
      data: {
        ...group.toObject(),
        userRole
      }
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al buscar el grupo', 
      error: error.message 
    });
  }
};

// Unirse a un grupo
export const joinGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grupo no encontrado' 
      });
    }

    // Verificar si ya es miembro
    const isMember = group.members.some(member => member.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'Ya eres miembro de este grupo'
      });
    }

    // Añadir como miembro
    group.members.push({
      user: userId,
      role: 'member',
      joinedAt: new Date()
    } as any);

    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('members.user', 'username firstName lastName profilePicture')
      .populate('category', 'name description color icon');

    return res.json({
      success: true,
      data: populatedGroup,
      message: 'Te has unido al grupo exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al unirse al grupo', 
      error: error.message 
    });
  }
};

// Salir de un grupo
export const leaveGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grupo no encontrado' 
      });
    }

    // Verificar si es miembro
    const memberIndex = group.members.findIndex(member => member.user.toString() === userId);
    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'No eres miembro de este grupo'
      });
    }

    // No permitir que el creador salga del grupo
    if (group.creator.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'El creador del grupo no puede abandonarlo. Transfiere la administración primero.'
      });
    }

    // Remover al miembro
    group.members.splice(memberIndex, 1);
    await group.save();

    return res.json({
      success: true,
      message: 'Has salido del grupo exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al salir del grupo', 
      error: error.message 
    });
  }
};

// Actualizar rol de un miembro (solo admin)
export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;
    const userId = (req as any).user?.userId;

    if (!['admin', 'moderator', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grupo no encontrado' 
      });
    }

    // Verificar que el usuario actual es admin
    const currentMember = group.members.find(m => m.user.toString() === userId);
    if (!currentMember || currentMember.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden cambiar roles'
      });
    }

    // Encontrar al miembro a actualizar
    const memberToUpdate = group.members.find(m => m.user.toString() === memberId);
    if (!memberToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Miembro no encontrado en el grupo'
      });
    }

    // No permitir cambiar el rol del creador del grupo
    if (group.creator.toString() === memberId) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cambiar el rol del creador del grupo'
      });
    }

    memberToUpdate.role = role as 'admin' | 'moderator' | 'member';
    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('members.user', 'username firstName lastName profilePicture')
      .populate('category', 'name description color icon');

    return res.json({
      success: true,
      data: populatedGroup,
      message: 'Rol actualizado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar el rol', 
      error: error.message 
    });
  }
};

// Eliminar un grupo (solo creador)
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grupo no encontrado' 
      });
    }

    // Solo el creador puede eliminar el grupo
    if (group.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador puede eliminar el grupo'
      });
    }

    await group.deleteOne();

    return res.json({
      success: true,
      message: 'Grupo eliminado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar el grupo', 
      error: error.message 
    });
  }
};
import { Request, Response } from 'express';
import User from './user.model';
import Post from './post.model';

// --- User Management ---

/**
 * @desc    List all users (Admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const listAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Excluimos la contraseña del resultado
    const users = await User.find({}).select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
  }
};

/**
 * @desc    Update a user's details (Admin)
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
export const updateUserByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    // Los campos que un admin puede modificar
    const { firstName, lastName, email, username, role, isActive, isEmailVerified } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.role = role || user.role;
    // Para los booleans, verificamos explícitamente si se pasaron en el body
    if (isActive !== undefined) user.isActive = isActive;
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;
    
    const updatedUser = await user.save();
    // No enviar la contraseña en la respuesta
    (updatedUser as any).password = undefined; 

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al actualizar usuario', error: error.message });
  }
};

// --- Post Management ---

/**
 * @desc    Delete any post (Admin)
 * @route   DELETE /api/admin/posts/:id
 * @access  Private/Admin
 */
export const deletePostByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404).json({ success: false, message: 'Post no encontrado' });
            return;
        }

        await post.deleteOne();

        res.status(200).json({ success: true, message: 'Post eliminado por el administrador' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error al eliminar el post', error: error.message });
    }
}; 
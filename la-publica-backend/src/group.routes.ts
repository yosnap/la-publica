import { Router } from 'express';
import { 
  createGroup, 
  listGroups, 
  getUserGroups, 
  getGroupById, 
  joinGroup, 
  leaveGroup, 
  updateMemberRole, 
  updateGroup,
  removeMember,
  getGroupStats,
  transferOwnership,
  deleteGroup 
} from './group.controller';
import {
  createGroupCategory,
  listGroupCategories,
  getGroupCategoryById,
  updateGroupCategory,
  deleteGroupCategory
} from './groupCategory.controller';
import { authenticate } from './middleware/auth';

const router = Router();

// --- Rutas Públicas ---
// Listar grupos públicos
router.get('/', listGroups);

// Listar categorías de grupos
router.get('/categories', listGroupCategories);

// Ver una categoría específica
router.get('/categories/:id', getGroupCategoryById);

// --- Rutas Protegidas ---
// Obtener los grupos del usuario autenticado (DEBE IR ANTES que /:id)
router.get('/me/groups', authenticate, getUserGroups);

// Ver un grupo específico (público o privado si es miembro)
router.get('/:id', authenticate, getGroupById);

// Crear un nuevo grupo
router.post('/', authenticate, createGroup);

// Unirse a un grupo
router.post('/:id/join', authenticate, joinGroup);

// Salir de un grupo
router.post('/:id/leave', authenticate, leaveGroup);

// Actualizar información del grupo (solo admin)
router.put('/:id', authenticate, updateGroup);

// Actualizar rol de un miembro (solo admin)
router.patch('/:id/members/:memberId/role', authenticate, updateMemberRole);

// Remover miembro del grupo (solo admin)
router.delete('/:id/members/:memberId', authenticate, removeMember);

// Obtener estadísticas del grupo (solo admin/moderador)
router.get('/:id/stats', authenticate, getGroupStats);

// Transferir propiedad del grupo (solo creador)
router.post('/:id/transfer-ownership', authenticate, transferOwnership);

// Eliminar un grupo (solo creador)
router.delete('/:id', authenticate, deleteGroup);

// === RUTAS DE CATEGORÍAS (Solo Admin) ===
// Crear categoría
router.post('/categories', authenticate, createGroupCategory);

// Actualizar categoría
router.put('/categories/:id', authenticate, updateGroupCategory);

// Eliminar categoría
router.delete('/categories/:id', authenticate, deleteGroupCategory);

export default router;
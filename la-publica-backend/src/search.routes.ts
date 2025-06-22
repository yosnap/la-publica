import { Router } from 'express';
import { searchAll } from './search.controller';

const router = Router();

// Ruta principal de búsqueda
// GET /api/search?q=termino&type=users|posts
router.get('/', searchAll);

export default router; 
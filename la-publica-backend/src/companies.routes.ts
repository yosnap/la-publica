import express from 'express';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';
import {
  createCompany,
  listCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getMyCompanies,
  updateVerificationStatus
} from './companies.controller';

const router = express.Router();

// Rutas públicas
router.get('/', listCompanies);
router.get('/:id', getCompanyById);

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Rutas para colaboradores y admin
router.post('/', authorize(['colaborador', 'admin', 'superadmin']), createCompany);
router.get('/my/companies', getMyCompanies);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

// Rutas para administradores
router.patch('/:id/verification', authorize(['admin']), updateVerificationStatus);

export default router;
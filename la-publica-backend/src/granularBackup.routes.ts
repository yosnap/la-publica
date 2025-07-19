import express from 'express';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';
import {
  exportGranularData,
  getBackupPreview,
  importGranularData
} from './granularBackup.controller';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// GET /api/granular-backup/preview - Get statistics and preview of data to backup
router.get('/preview', getBackupPreview);

// POST /api/granular-backup/export - Export selected data with granular options
router.post('/export', exportGranularData);

// POST /api/granular-backup/import - Import data from backup file
router.post('/import', importGranularData);

export default router;
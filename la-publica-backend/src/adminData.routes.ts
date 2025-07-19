import express from 'express';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';
import {
  getUsers,
  updateUser,
  deleteUser,
  getPosts,
  updatePost,
  deletePost,
  getCompanies,
  updateCompany,
  getGroups,
  getForums,
  getJobOffers,
  getAnnouncements,
  getAdvisories,
  bulkUpdateItems,
  bulkDeleteItems,
  assignAuthor,
  assignCategory
} from './adminData.controller';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// Users Management
router.get('/users', getUsers);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Posts Management
router.get('/posts', getPosts);
router.put('/posts/:postId', updatePost);
router.delete('/posts/:postId', deletePost);

// Companies Management
router.get('/companies', getCompanies);
router.put('/companies/:companyId', updateCompany);

// Groups Management
router.get('/groups', getGroups);

// Forums Management
router.get('/forums', getForums);

// Job Offers Management
router.get('/job-offers', getJobOffers);

// Announcements Management
router.get('/announcements', getAnnouncements);

// Advisories Management
router.get('/advisories', getAdvisories);

// Bulk Operations
router.post('/bulk/update', bulkUpdateItems);
router.post('/bulk/delete', bulkDeleteItems);

// Author and Category Assignment
router.post('/assign/author', assignAuthor);
router.post('/assign/category', assignCategory);

export default router;
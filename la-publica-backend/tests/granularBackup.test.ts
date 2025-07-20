import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/server';
import User from '../src/user.model';
import Company from '../src/company.model';
import Category from '../src/category.model';
import { JWTService } from '../src/utils/jwt';

let mongoServer: MongoMemoryServer;
let adminToken: string;
let adminUserId: string;

beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Close existing connection if any
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri);
  
  // Create admin user
  const adminUser = await User.create({
    firstName: 'Admin',
    lastName: 'Test',
    email: 'admin@test.com',
    username: 'admintest',
    password: 'password123',
    role: 'admin'
  });
  
  adminUserId = (adminUser._id as mongoose.Types.ObjectId).toString();
  adminToken = JWTService.generateAccessToken({
    userId: adminUserId,
    email: adminUser.email!,
    role: 'admin'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    // Keep the admin user
    if (key !== 'users') {
      await collections[key].deleteMany({});
    } else {
      await collections[key].deleteMany({ role: { $ne: 'admin' } });
    }
  }
});

describe('Granular Backup Import', () => {
  describe('POST /api/granular-backup/import', () => {
    it('should reject non-admin users', async () => {
      // Create regular user
      const regularUser = await User.create({
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@test.com',
        username: 'regularuser',
        password: 'password123',
        role: 'user'
      });
      
      const userToken = JWTService.generateAccessToken({
        userId: (regularUser._id as mongoose.Types.ObjectId).toString(),
        email: regularUser.email!,
        role: 'user'
      });
      
      const response = await request(app)
        .post('/api/granular-backup/import')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ backupData: {}, options: {} });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permisos');
    });
    
    it('should validate backup data structure', async () => {
      const response = await request(app)
        .post('/api/granular-backup/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ backupData: null });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('invàlides');
    });
    
    it('should import categories successfully', async () => {
      const backupData = {
        version: '2.0.0',
        exportDate: new Date().toISOString(),
        platform: 'La Pública - Test',
        data: {
          categories: [
            {
              name: 'Tecnologia',
              type: 'company',
              description: 'Empreses tecnològiques',
              color: '#3B82F6',
              isActive: true,
              order: 1
            },
            {
              name: 'Marketing',
              type: 'company',
              description: 'Agències de màrqueting',
              color: '#10B981',
              isActive: true,
              order: 2
            }
          ]
        }
      };
      
      const response = await request(app)
        .post('/api/granular-backup/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          backupData,
          options: {
            importCategories: true,
            replaceExisting: false
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.categories).toEqual({
        created: 2,
        updated: 0,
        skipped: 0,
        errors: 0
      });
      
      // Verify categories were created
      const categories = await Category.find({});
      expect(categories).toHaveLength(2);
      expect(categories.map(c => c.name)).toContain('Tecnologia');
      expect(categories.map(c => c.name)).toContain('Marketing');
    });
    
    it('should skip existing categories when replaceExisting is false', async () => {
      // Create existing category
      await Category.create({
        name: 'Tecnologia',
        type: 'company',
        description: 'Existing description',
        color: '#000000',
        isActive: true
      });
      
      const backupData = {
        version: '2.0.0',
        exportDate: new Date().toISOString(),
        platform: 'La Pública - Test',
        data: {
          categories: [
            {
              name: 'Tecnologia',
              type: 'company',
              description: 'New description',
              color: '#3B82F6',
              isActive: true
            }
          ]
        }
      };
      
      const response = await request(app)
        .post('/api/granular-backup/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          backupData,
          options: {
            importCategories: true,
            replaceExisting: false
          }
        });
      
      expect(response.body.data.results.categories).toEqual({
        created: 0,
        updated: 0,
        skipped: 1,
        errors: 0
      });
      
      // Verify original category wasn't modified
      const category = await Category.findOne({ name: 'Tecnologia' });
      expect(category?.description).toBe('Existing description');
      expect(category?.color).toBe('#000000');
    });
    
    it('should import companies with owner references', async () => {
      // Create a user to be the owner
      const owner = await User.create({
        firstName: 'Company',
        lastName: 'Owner',
        email: 'owner@test.com',
        username: 'companyowner',
        password: 'password123',
        role: 'colaborador'
      });
      
      // Create a category first
      const category = await Category.create({
        name: 'Technology',
        type: 'company',
        description: 'Tech category',
        isActive: true
      });
      
      const backupData = {
        version: '2.0.0',
        exportDate: new Date().toISOString(),
        platform: 'La Pública - Test',
        data: {
          companies: [
            {
              name: 'Tech Solutions',
              description: 'Software development',
              email: 'info@techsolutions.com',
              category: category._id.toString(),
              size: 'small',
              location: {
                address: 'Test Address 123',
                city: 'Barcelona',
                country: 'España'
              },
              verified: {
                status: 'verified'
              },
              stats: {},
              owner: {
                email: 'owner@test.com',
                firstName: 'Company',
                lastName: 'Owner'
              }
            }
          ]
        }
      };
      
      const response = await request(app)
        .post('/api/granular-backup/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          backupData,
          options: {
            importCompanies: true,
            replaceExisting: false
          }
        });
      
      expect(response.body.data.results.companies).toEqual({
        created: 1,
        updated: 0,
        skipped: 0,
        errors: 0
      });
      
      // Verify company was created with correct owner
      const company = await Company.findOne({ name: 'Tech Solutions' }).populate('owner');
      expect(company).toBeTruthy();
      expect(company?.owner).toBeTruthy();
      expect((company?.owner as any).email).toBe('owner@test.com');
    });
    
    it('should use admin as owner when original owner not found', async () => {
      // Create a category first
      const category = await Category.create({
        name: 'Technology',
        type: 'company',
        description: 'Tech category',
        isActive: true
      });
      
      const backupData = {
        version: '2.0.0',
        exportDate: new Date().toISOString(),
        platform: 'La Pública - Test',
        data: {
          companies: [
            {
              name: 'Orphan Company',
              description: 'Company without owner',
              email: 'info@orphan.com',
              category: category._id.toString(),
              size: 'small',
              location: {
                address: 'Test Address 123',
                city: 'Barcelona',
                country: 'España'
              },
              verified: {
                status: 'pending'
              },
              stats: {},
              owner: {
                email: 'nonexistent@test.com',
                firstName: 'Non',
                lastName: 'Existent'
              }
            }
          ]
        }
      };
      
      const response = await request(app)
        .post('/api/granular-backup/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          backupData,
          options: {
            importCompanies: true,
            replaceExisting: false
          }
        });
      
      expect(response.body.data.results.companies.created).toBe(1);
      
      // Verify company was created with admin as owner
      const company = await Company.findOne({ name: 'Orphan Company' });
      expect(company?.owner.toString()).toBe(adminUserId);
    });
    
    it('should handle complex data with multiple references', async () => {
      // Create category first
      const category = await Category.create({
        name: 'Tecnologia',
        type: 'company',
        description: 'Tech category',
        isActive: true
      });
      
      const backupData = {
        version: '2.0.0',
        exportDate: new Date().toISOString(),
        platform: 'La Pública - Test',
        data: {
          users: [
            {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@test.com',
              username: 'johndoe',
              role: 'colaborador'
            }
          ],
          companies: [
            {
              name: 'Tech Corp',
              description: 'Technology company',
              email: 'info@techcorp.com',
              size: 'medium',
              location: {
                address: 'Tech Street 456',
                city: 'Madrid',
                country: 'España'
              },
              verified: {
                status: 'verified'
              },
              stats: {},
              owner: {
                email: 'john@test.com'
              },
              category: {
                name: 'Tecnologia'
              }
            }
          ]
        }
      };
      
      const response = await request(app)
        .post('/api/granular-backup/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          backupData,
          options: {
            importUsers: true,
            importCompanies: true,
            replaceExisting: false
          }
        });
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.users.created).toBe(1);
      expect(response.body.data.results.companies.created).toBe(1);
      
      // Verify relationships
      const company = await Company.findOne({ name: 'Tech Corp' })
        .populate('owner')
        .populate('category');
      
      expect(company).toBeTruthy();
      expect((company?.owner as any).email).toBe('john@test.com');
      expect((company?.category as any).name).toBe('Tecnologia');
    });
  });
  
  describe('Export and Import Round Trip', () => {
    it('should successfully export and re-import data', async () => {
      // Create test data
      const category = await Category.create({
        name: 'Test Category',
        type: 'company',
        description: 'Test',
        isActive: true
      });
      
      const owner = await User.create({
        firstName: 'Export',
        lastName: 'Test',
        email: 'export@test.com',
        username: 'exporttest',
        password: 'password123',
        role: 'colaborador'
      });
      
      const company = await Company.create({
        name: 'Export Company',
        description: 'Test export',
        email: 'company@test.com',
        owner: owner._id,
        category: category._id,
        size: 'large',
        location: {
          address: 'Export Street 789',
          city: 'Valencia',
          country: 'España'
        },
        verified: {
          status: 'verified'
        },
        stats: {}
      });
      
      // Export data
      const exportResponse = await request(app)
        .post('/api/granular-backup/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          includeUsers: true,
          includeCompanies: true,
          includeCategories: true
        });
      
      expect(exportResponse.status).toBe(200);
      const exportedData = exportResponse.body;
      
      // Clear database (except admin)
      await Company.deleteMany({});
      await Category.deleteMany({});
      await User.deleteMany({ role: { $ne: 'admin' } });
      
      // Re-import data
      const importResponse = await request(app)
        .post('/api/granular-backup/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          backupData: exportedData,
          options: {
            importUsers: true,
            importCompanies: true,
            importCategories: true,
            replaceExisting: false
          }
        });
      
      expect(importResponse.status).toBe(200);
      expect(importResponse.body.success).toBe(true);
      
      // Verify data was restored
      const users = await User.find({ role: 'colaborador' });
      const companies = await Company.find({});
      const categories = await Category.find({});
      
      expect(users).toHaveLength(1);
      expect(companies).toHaveLength(1);
      expect(categories).toHaveLength(1);
      
      expect(companies[0].name).toBe('Export Company');
      expect(categories[0].name).toBe('Test Category');
    });
  });
});
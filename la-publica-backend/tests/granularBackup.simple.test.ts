import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/server';
import User from '../src/user.model';
import Category from '../src/category.model';
import { JWTService } from '../src/utils/jwt';

let mongoServer: MongoMemoryServer;
let adminToken: string;

// Disable server startup for tests
process.env.NODE_ENV = 'test';

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
  
  adminToken = JWTService.generateAccessToken({
    userId: (adminUser._id as mongoose.Types.ObjectId).toString(),
    email: adminUser.email!,
    role: 'admin'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Granular Backup Import - Basic Tests', () => {
  beforeEach(async () => {
    // Clear categories before each test
    await Category.deleteMany({});
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
      created: 1,
      updated: 0,
      skipped: 0,
      errors: 0
    });
    
    // Verify category was created
    const categories = await Category.find({});
    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe('Tecnologia');
  });

  it('should reject requests without valid authentication', async () => {
    const response = await request(app)
      .post('/api/granular-backup/import')
      .send({ backupData: {}, options: {} });
    
    expect(response.status).toBe(401);
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
});
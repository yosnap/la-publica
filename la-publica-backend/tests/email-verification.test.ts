import request from 'supertest';
import { app } from '../src/server';
import User from '../src/user.model';
import mongoose from 'mongoose';
import crypto from 'crypto';

describe('Email Verification Flow', () => {
  let testUser: any;
  let verificationToken: string;

  beforeAll(async () => {
    // Generar token de verificación
    verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear un usuario de prueba NO verificado
    testUser = await User.create({
      email: 'test-verification@lapublica.cat',
      username: 'testverification',
      firstName: 'Test',
      lastName: 'Verification',
      password: await require('../src/utils/helpers').PasswordService.hashPassword('Password123'),
      role: 'user',
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });
  });

  afterAll(async () => {
    // Limpiar usuario de prueba
    await User.deleteOne({ email: 'test-verification@lapublica.cat' });
    await mongoose.connection.close();
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('verificat');
    });

    it('should mark user as verified in database', async () => {
      // Crear nuevo usuario para esta prueba
      const newToken = crypto.randomBytes(32).toString('hex');
      const newUser = await User.create({
        email: 'test-verify-2@lapublica.cat',
        username: 'testverify2',
        firstName: 'Test',
        lastName: 'Verify2',
        password: await require('../src/utils/helpers').PasswordService.hashPassword('Password123'),
        role: 'user',
        isEmailVerified: false,
        emailVerificationToken: newToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      await request(app)
        .post('/api/auth/verify-email')
        .send({ token: newToken });

      const user = await User.findOne({ email: 'test-verify-2@lapublica.cat' })
        .select('+emailVerificationToken +emailVerificationExpires');

      expect(user?.isEmailVerified).toBe(true);
      expect(user?.emailVerificationToken).toBeUndefined();
      expect(user?.emailVerificationExpires).toBeUndefined();

      // Limpiar
      await User.deleteOne({ email: 'test-verify-2@lapublica.cat' });
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token-12345' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('invàlid');
    });

    it('should reject expired token', async () => {
      // Crear usuario con token expirado
      const expiredToken = crypto.randomBytes(32).toString('hex');
      const expiredUser = await User.create({
        email: 'test-expired@lapublica.cat',
        username: 'testexpired',
        firstName: 'Test',
        lastName: 'Expired',
        password: await require('../src/utils/helpers').PasswordService.hashPassword('Password123'),
        role: 'user',
        isEmailVerified: false,
        emailVerificationToken: expiredToken,
        emailVerificationExpires: new Date(Date.now() - 1000) // Expirado hace 1 segundo
      });

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: expiredToken })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('caducat');

      // Limpiar
      await User.deleteOne({ email: 'test-expired@lapublica.cat' });
    });

    it('should reject if token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('requerit');
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    beforeEach(async () => {
      // Asegurar que el usuario de prueba NO esté verificado
      await User.updateOne(
        { email: 'test-verification@lapublica.cat' },
        {
          isEmailVerified: false,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      );
    });

    it('should resend verification email for unverified user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'test-verification@lapublica.cat' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('enviat');
    });

    it('should generate new verification token', async () => {
      const oldToken = verificationToken;

      await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'test-verification@lapublica.cat' });

      const user = await User.findOne({ email: 'test-verification@lapublica.cat' })
        .select('+emailVerificationToken');

      expect(user?.emailVerificationToken).toBeDefined();
      expect(user?.emailVerificationToken).not.toBe(oldToken); // Nuevo token diferente
    });

    it('should reject if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('requerit');
    });

    it('should reject if user not found', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('no trobat');
    });

    it('should reject if email already verified', async () => {
      // Marcar usuario como verificado
      await User.updateOne(
        { email: 'test-verification@lapublica.cat' },
        { isEmailVerified: true }
      );

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'test-verification@lapublica.cat' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('ja està verificat');
    });
  });

  describe('Registration with Email Verification', () => {
    it('should create user with isEmailVerified: false', async () => {
      const uniqueEmail = `newuser-${Date.now()}@lapublica.cat`;
      const uniqueUsername = `newuser${Date.now()}`;

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          username: uniqueUsername,
          firstName: 'New',
          lastName: 'User',
          password: 'NewPassword123',
          confirmPassword: 'NewPassword123'
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);

      const user = await User.findOne({ email: uniqueEmail });
      expect(user?.isEmailVerified).toBe(false);
      expect(user?.emailVerificationToken).toBeDefined();
      expect(user?.emailVerificationExpires).toBeDefined();

      // Limpiar
      await User.deleteOne({ email: uniqueEmail });
    });

    it('should send verification email on registration', async () => {
      const uniqueEmail = `newuser2-${Date.now()}@lapublica.cat`;
      const uniqueUsername = `newuser2${Date.now()}`;

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          username: uniqueUsername,
          firstName: 'New',
          lastName: 'User2',
          password: 'NewPassword123',
          confirmPassword: 'NewPassword123'
        })
        .expect(201);

      // Verificar que se creó un log de email
      const EmailLog = mongoose.model('EmailLog', new mongoose.Schema({}, { strict: false }));
      const emailLog = await EmailLog.findOne({
        recipient: uniqueEmail
      }).sort({ sentAt: -1 });

      expect(emailLog).toBeDefined();
      // @ts-ignore - Ignorar error de TypeScript para el campo subject
      expect(emailLog?.subject).toContain('Verifica');

      // Limpiar
      await User.deleteOne({ email: uniqueEmail });
    });
  });

  describe('Login Restrictions', () => {
    it('should reject login for unverified user', async () => {
      // Crear usuario no verificado
      await User.create({
        email: 'unverified@lapublica.cat',
        username: 'unverified',
        firstName: 'Unverified',
        lastName: 'User',
        password: await require('../src/utils/helpers').PasswordService.hashPassword('Password123'),
        role: 'user',
        isEmailVerified: false
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'unverified@lapublica.cat',
          password: 'Password123'
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('verificar');

      // Limpiar
      await User.deleteOne({ email: 'unverified@lapublica.cat' });
    });

    it('should allow login for verified user', async () => {
      // Crear usuario verificado
      await User.create({
        email: 'verified@lapublica.cat',
        username: 'verified',
        firstName: 'Verified',
        lastName: 'User',
        password: await require('../src/utils/helpers').PasswordService.hashPassword('Password123'),
        role: 'user',
        isEmailVerified: true
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'verified@lapublica.cat',
          password: 'Password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');

      // Limpiar
      await User.deleteOne({ email: 'verified@lapublica.cat' });
    });
  });
});

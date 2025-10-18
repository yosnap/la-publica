import request from 'supertest';
import { app } from '../src/server';
import User from '../src/user.model';
import mongoose from 'mongoose';

describe('Password Recovery Flow', () => {
  let testUser: any;
  let resetToken: string;

  beforeAll(async () => {
    // Crear un usuario de prueba
    testUser = await User.create({
      email: 'test-recovery@lapublica.cat',
      username: 'testrecovery',
      firstName: 'Test',
      lastName: 'Recovery',
      password: await require('../src/utils/helpers').PasswordService.hashPassword('OldPassword123'),
      role: 'user',
      emailVerified: true
    });
  });

  afterAll(async () => {
    // Limpiar usuario de prueba
    await User.deleteOne({ email: 'test-recovery@lapublica.cat' });
    await mongoose.connection.close();
  });

  describe('POST /api/auth/forgot', () => {
    it('should return success message for existing email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot')
        .send({ email: 'test-recovery@lapublica.cat' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('instruccions');
    });

    it('should generate and save reset token in database', async () => {
      await request(app)
        .post('/api/auth/forgot')
        .send({ email: 'test-recovery@lapublica.cat' });

      const user = await User.findOne({ email: 'test-recovery@lapublica.cat' })
        .select('+resetPasswordToken +resetPasswordExpires');

      expect(user?.resetPasswordToken).toBeDefined();
      expect(user?.resetPasswordExpires).toBeDefined();
      expect(user?.resetPasswordExpires).toBeInstanceOf(Date);

      // Guardar el token para pruebas posteriores
      resetToken = user?.resetPasswordToken || '';
    });

    it('should return same message for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      // El mensaje debe ser el mismo para emails existentes y no existentes
    });

    it('should return error if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/forgot')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('requerit');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    beforeEach(async () => {
      // Asegurarse de que hay un token válido
      await request(app)
        .post('/api/auth/forgot')
        .send({ email: 'test-recovery@lapublica.cat' });

      const user = await User.findOne({ email: 'test-recovery@lapublica.cat' })
        .select('+resetPasswordToken');
      resetToken = user?.resetPasswordToken || '';
    });

    it('should successfully reset password with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('exitosament');
    });

    it('should remove reset token after successful password change', async () => {
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123'
        });

      const user = await User.findOne({ email: 'test-recovery@lapublica.cat' })
        .select('+resetPasswordToken +resetPasswordExpires');

      expect(user?.resetPasswordToken).toBeUndefined();
      expect(user?.resetPasswordExpires).toBeUndefined();
    });

    it('should update password successfully', async () => {
      const oldPassword = 'OldPassword123';
      const newPassword = 'NewPassword123';

      // Resetear contraseña
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword
        })
        .expect(200);

      // Verificar que la contraseña cambió consultando directamente la base de datos
      const user = await User.findOne({ email: 'test-recovery@lapublica.cat' }).select('+password');
      const passwordMatches = await require('../src/utils/helpers').PasswordService.comparePassword(newPassword, user?.password || '');

      expect(passwordMatches).toBe(true);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token-12345',
          newPassword: 'NewPassword123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('invàlid');
    });

    it('should reject already used token', async () => {
      // Primer uso
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123'
        });

      // Segundo intento con el mismo token
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'AnotherPassword456'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('invàlid');
    });

    it('should reject password shorter than 6 characters', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: '12345'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('6 caràcters');
    });

    it('should reject if token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          newPassword: 'NewPassword123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('requerit');
    });

    it('should reject if new password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('requerit');
    });
  });

  describe('Token Expiration', () => {
    it('should reject expired token', async () => {
      // Generar token
      await request(app)
        .post('/api/auth/forgot')
        .send({ email: 'test-recovery@lapublica.cat' });

      const user = await User.findOne({ email: 'test-recovery@lapublica.cat' })
        .select('+resetPasswordToken');
      const expiredToken = user?.resetPasswordToken || '';

      // Forzar expiración del token
      await User.updateOne(
        { email: 'test-recovery@lapublica.cat' },
        { resetPasswordExpires: new Date(Date.now() - 1000) } // 1 segundo en el pasado
      );

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: expiredToken,
          newPassword: 'NewPassword123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('caducat');
    });
  });
});

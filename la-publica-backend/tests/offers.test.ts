import request from 'supertest';
import { app } from '../src/server';
import User from '../src/user.model';
import Offer from '../src/offer.model';
import mongoose from 'mongoose';

describe('Offers System', () => {
  let colaboradorToken: string;
  let colaboradorId: string;
  let adminToken: string;
  let userToken: string;
  let testOfferId: string;
  let testOfferSlug: string;

  beforeAll(async () => {
    // Crear usuario colaborador de prueba
    const colaboradorResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'colaborador-offers@test.com',
        username: 'colaboradoroffers',
        firstName: 'Colaborador',
        lastName: 'Test',
        password: 'TestPassword123',
        role: 'colaborador'
      });

    if (colaboradorResponse.body.token) {
      colaboradorToken = colaboradorResponse.body.token;
      colaboradorId = colaboradorResponse.body.user._id;
    } else {
      // Si ya existe, hacer login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'colaborador-offers@test.com',
          password: 'TestPassword123'
        });
      colaboradorToken = loginResponse.body.token;
      colaboradorId = loginResponse.body.user._id;
    }

    // Crear usuario admin de prueba
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin-offers@test.com',
        username: 'adminoffers',
        firstName: 'Admin',
        lastName: 'Test',
        password: 'TestPassword123',
        role: 'admin'
      });

    if (adminResponse.body.token) {
      adminToken = adminResponse.body.token;
      // Actualizar el rol a admin directamente en la base de datos
      await User.findOneAndUpdate(
        { email: 'admin-offers@test.com' },
        { role: 'admin' }
      );
    } else {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'admin-offers@test.com',
          password: 'TestPassword123'
        });
      adminToken = loginResponse.body.token;
    }

    // Crear usuario normal de prueba
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user-offers@test.com',
        username: 'useroffers',
        firstName: 'User',
        lastName: 'Test',
        password: 'TestPassword123',
        role: 'user'
      });

    if (userResponse.body.token) {
      userToken = userResponse.body.token;
    } else {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'user-offers@test.com',
          password: 'TestPassword123'
        });
      userToken = loginResponse.body.token;
    }
  });

  afterAll(async () => {
    // Limpiar usuarios de prueba
    await User.deleteOne({ email: 'colaborador-offers@test.com' });
    await User.deleteOne({ email: 'admin-offers@test.com' });
    await User.deleteOne({ email: 'user-offers@test.com' });

    // Limpiar ofertas de prueba
    await Offer.deleteMany({ title: /Oferta de prueba/i });

    await mongoose.connection.close();
  });

  describe('POST /api/offers - Crear oferta', () => {
    it('debería permitir a un colaborador crear una oferta', async () => {
      const offerData = {
        title: 'Oferta de prueba 1',
        description: 'Esta es una oferta de prueba con descripción detallada',
        originalPrice: 100,
        discountedPrice: 70,
        startDate: new Date(Date.now() + 86400000).toISOString(), // Mañana
        endDate: new Date(Date.now() + 7 * 86400000).toISOString(), // En 7 días
        stock: 50,
        included: ['Servicio 1', 'Servicio 2'],
        notIncluded: ['Servicio 3'],
        usageInstructions: 'Instrucciones de uso de la oferta',
        mainImage: 'https://example.com/image.jpg',
        gallery: ['https://example.com/gallery1.jpg'],
        videoUrl: 'https://youtube.com/watch?v=test'
      };

      const response = await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${colaboradorToken}`)
        .send(offerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.offer).toBeDefined();
      expect(response.body.offer.title).toBe(offerData.title);
      expect(response.body.offer.slug).toBe('oferta-de-prueba-1');
      expect(response.body.offer.discountPercentage).toBe(30);

      // Guardar para pruebas posteriores
      testOfferId = response.body.offer._id;
      testOfferSlug = response.body.offer.slug;
    });

    it('debería rechazar la creación si el usuario no es colaborador', async () => {
      const offerData = {
        title: 'Oferta de prueba no autorizada',
        description: 'Esta oferta no debería ser creada',
        originalPrice: 100,
        discountedPrice: 70,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        stock: 50,
        mainImage: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${userToken}`)
        .send(offerData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('col·laboradors');
    });

    it('debería validar que el precio con descuento sea menor que el original', async () => {
      const offerData = {
        title: 'Oferta con precios inválidos',
        description: 'Esta oferta tiene precios incorrectos',
        originalPrice: 70,
        discountedPrice: 100, // Mayor que el original
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        stock: 50,
        mainImage: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${colaboradorToken}`)
        .send(offerData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/offers - Listar ofertas', () => {
    it('debería listar las ofertas públicamente', async () => {
      const response = await request(app)
        .get('/api/offers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.offers)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('debería soportar filtros de búsqueda', async () => {
      const response = await request(app)
        .get('/api/offers?search=prueba')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.offers)).toBe(true);
    });

    it('debería soportar paginación', async () => {
      const response = await request(app)
        .get('/api/offers?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.page).toBe(1);
    });
  });

  describe('GET /api/offers/:slug - Obtener oferta por slug', () => {
    it('debería obtener una oferta por su slug', async () => {
      const response = await request(app)
        .get(`/api/offers/${testOfferSlug}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.offer).toBeDefined();
      expect(response.body.offer.slug).toBe(testOfferSlug);
    });

    it('debería incrementar el contador de vistas', async () => {
      const initialResponse = await request(app)
        .get(`/api/offers/${testOfferSlug}`)
        .expect(200);

      const initialViews = initialResponse.body.offer.views;

      await request(app)
        .get(`/api/offers/${testOfferSlug}`)
        .expect(200);

      const finalResponse = await request(app)
        .get(`/api/offers/${testOfferSlug}`)
        .expect(200);

      expect(finalResponse.body.offer.views).toBeGreaterThan(initialViews);
    });

    it('debería devolver 404 para slug inexistente', async () => {
      const response = await request(app)
        .get('/api/offers/oferta-inexistente-12345')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/offers/:id - Actualizar oferta', () => {
    it('debería permitir al creador actualizar su oferta', async () => {
      const updateData = {
        title: 'Oferta de prueba 1 - Actualizada',
        originalPrice: 120,
        discountedPrice: 84
      };

      const response = await request(app)
        .put(`/api/offers/${testOfferId}`)
        .set('Authorization', `Bearer ${colaboradorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.offer.title).toBe(updateData.title);
      expect(response.body.offer.originalPrice).toBe(updateData.originalPrice);
    });

    it('debería rechazar actualización de otro usuario', async () => {
      const updateData = {
        title: 'Intento de actualización no autorizado'
      };

      const response = await request(app)
        .put(`/api/offers/${testOfferId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('debería permitir a un admin actualizar cualquier oferta', async () => {
      const updateData = {
        description: 'Actualización realizada por admin'
      };

      const response = await request(app)
        .put(`/api/offers/${testOfferId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.offer.description).toBe(updateData.description);
    });
  });

  describe('PATCH /api/offers/:id/toggle-pause - Pausar/Reanudar oferta', () => {
    it('debería pausar una oferta activa', async () => {
      const response = await request(app)
        .patch(`/api/offers/${testOfferId}/toggle-pause`)
        .set('Authorization', `Bearer ${colaboradorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('pausada');
      expect(response.body.offer.isPaused).toBe(true);
    });

    it('debería reanudar una oferta pausada', async () => {
      const response = await request(app)
        .patch(`/api/offers/${testOfferId}/toggle-pause`)
        .set('Authorization', `Bearer ${colaboradorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reactivada');
      expect(response.body.offer.isPaused).toBe(false);
    });
  });

  describe('Sistema de Cupones', () => {
    let couponCode: string;

    describe('POST /api/offers/:id/coupons - Crear cupón', () => {
      it('debería permitir crear un cupón para la oferta', async () => {
        const couponData = {
          code: 'TESTCUPON2024',
          discountPercentage: 10,
          maxUses: 100,
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 7 * 86400000).toISOString()
        };

        const response = await request(app)
          .post(`/api/offers/${testOfferId}/coupons`)
          .set('Authorization', `Bearer ${colaboradorToken}`)
          .send(couponData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.coupon.code).toBe(couponData.code.toUpperCase());
        couponCode = response.body.coupon.code;
      });

      it('debería rechazar cupón con código duplicado', async () => {
        const couponData = {
          code: 'TESTCUPON2024',
          discountPercentage: 10,
          maxUses: 100,
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 7 * 86400000).toISOString()
        };

        const response = await request(app)
          .post(`/api/offers/${testOfferId}/coupons`)
          .set('Authorization', `Bearer ${colaboradorToken}`)
          .send(couponData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('ja existeix');
      });
    });

    describe('POST /api/offers/:id/coupons/validate - Validar cupón', () => {
      it('debería validar un cupón correcto y calcular el precio final', async () => {
        const response = await request(app)
          .post(`/api/offers/${testOfferId}/coupons/validate`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ code: couponCode })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.coupon).toBeDefined();
        expect(response.body.pricing).toBeDefined();
        expect(response.body.pricing.finalPrice).toBeLessThan(
          response.body.pricing.baseDiscountedPrice
        );
      });

      it('debería rechazar un cupón inválido', async () => {
        const response = await request(app)
          .post(`/api/offers/${testOfferId}/coupons/validate`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ code: 'INVALID_COUPON' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('no és vàlid');
      });
    });

    describe('PATCH /api/offers/:id/coupons/:code/deactivate - Desactivar cupón', () => {
      it('debería desactivar un cupón existente', async () => {
        const response = await request(app)
          .patch(`/api/offers/${testOfferId}/coupons/${couponCode}/deactivate`)
          .set('Authorization', `Bearer ${colaboradorToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('desactivat');
      });

      it('debería rechazar validación de cupón desactivado', async () => {
        const response = await request(app)
          .post(`/api/offers/${testOfferId}/coupons/validate`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ code: couponCode })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('no és vàlid');
      });
    });
  });

  describe('GET /api/offers/my-offers - Mis ofertas', () => {
    it('debería listar las ofertas del colaborador', async () => {
      const response = await request(app)
        .get('/api/offers/my-offers')
        .set('Authorization', `Bearer ${colaboradorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.offers)).toBe(true);
      expect(response.body.offers.length).toBeGreaterThan(0);
    });

    it('debería rechazar acceso sin autenticación', async () => {
      const response = await request(app)
        .get('/api/offers/my-offers')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/offers/:id - Eliminar oferta', () => {
    it('debería rechazar eliminación de usuario no autorizado', async () => {
      const response = await request(app)
        .delete(`/api/offers/${testOfferId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('debería permitir al creador eliminar su oferta', async () => {
      const response = await request(app)
        .delete(`/api/offers/${testOfferId}`)
        .set('Authorization', `Bearer ${colaboradorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('eliminada');
    });

    it('debería devolver 404 para oferta ya eliminada', async () => {
      const response = await request(app)
        .get(`/api/offers/${testOfferSlug}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

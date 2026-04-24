import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '~/app.module';
import { GlobalExceptionsFilter } from '~/config/global-exception.filter';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/drizzle';
import type { DrizzleSchema } from '~/infrastructure/database/drizzle';
import { ResponseInterceptor } from '~/presentation/interceptors/response.interceptor';

import { truncateDatabase } from '../common/database.helper';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let db: NodePgDatabase<DrizzleSchema>;
  let accessToken: string;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new GlobalExceptionsFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    await app.init();

    db = app.get(DRIZZLE_TOKEN);

    // Clean up users table before tests
    await truncateDatabase(db);
  });

  afterAll(async () => {
    // Clean up after tests
    await truncateDatabase(db);
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.fullName).toBe(testUser.fullName);
      expect(response.body.data.passwordHash).toBeUndefined(); // Should not return sensitive data
      expect(response.body.data.refreshTokenHash).toBeUndefined();
      expect(response.body.data.roles).toBeArray();
    });

    it('should fail if email already exists', async () => {
      const response = await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBe('Email already in use');
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login and return tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.passwordHash).toBeUndefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeString();
      expect(response.body.data.tokens.refreshToken).toBeString();

      // Save token for next tests
      accessToken = response.body.data.tokens.accessToken;
    });

    it('should fail with invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('/auth/me (GET)', () => {
    it('should return current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.passwordHash).toBeUndefined();
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer()).get('/auth/me').set('Authorization', 'Bearer invalid.token.here').expect(401);
    });
  });
});

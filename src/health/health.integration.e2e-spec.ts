import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import mongoose from 'mongoose';
import request from 'supertest';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { HealthController } from './health.controller';
import { HealthModule } from './health.module';

describe('HealthController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), HealthModule, TerminusModule],
      controllers: [HealthController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  describe('/get /health', () => {
    it('should return ok status', async () => {
      const res = await request(server).get('/health').expect(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: 'ok',
          details: {
            mongoose: {
              status: 'up',
            },
          },
        }),
      );
    });

    it('should return error status', async () => {
      // force databaser to disconnect
      await mongoose.disconnect();

      // check if endpoint responds with error
      const res = await request(server)
        .get('/health')
        .expect(HttpStatus.SERVICE_UNAVAILABLE);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: 'error',
          error: {
            mongoose: {
              status: 'down',
            },
          },
        }),
      );
    });
  });

  afterAll(async () => {
    server.close();
    await closeInMongodConnection();
    await app.close();
  });
});

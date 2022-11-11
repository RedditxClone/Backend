import type { HealthCheckResult } from '@nestjs/terminus';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import mongoose from 'mongoose';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { HealthController } from './health.controller';
import { HealthModule } from './health.module';
import { healthCheckStub } from './test/stubs/health.stubs';

describe('HealthController', () => {
  let controller: HealthController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), HealthModule],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a proper health check result', async () => {
    const healthCheckResult: HealthCheckResult = await controller.check();
    expect(healthCheckResult).toEqual(
      expect.objectContaining(healthCheckStub()),
    );
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await mongoose.disconnect();
  });
});

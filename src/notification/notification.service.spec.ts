import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { rootMongooseTestModule } from '../utils/mongoose-in-memory';
import { NotificationModule } from './notification.module';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NotificationModule, rootMongooseTestModule()],
      providers: [],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { TestModelSchema } from '../utils/testing/test-api-feature-model-testing';
import { VoteSchema } from './vote.schema';
import { VoteService } from './vote.service';

describe('voteService', () => {
  let service: VoteService;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'TestModel', schema: TestModelSchema },
          {
            name: 'Vote',
            schema: VoteSchema,
          },
        ]),
      ],
      providers: [VoteService],
    }).compile();
    service = module.get<VoteService>(VoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { VoteSchema } from './vote.schema';
import { VoteService } from './vote.service';

describe('VoteService', () => {
  let service: VoteService;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
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
  beforeAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

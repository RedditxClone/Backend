import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { BlockService } from '../block/block.service';
import { FollowService } from '../follow/follow.service';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { ImagesHandlerService } from '../utils/imagesHandler/images-handler.service';
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
          {
            name: 'User',
            schema: UserSchema,
          },
        ]),
      ],
      providers: [
        VoteService,
        UserService,
        FollowService,
        BlockService,
        ImagesHandlerService,
      ],
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

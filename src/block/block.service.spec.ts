import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { UserSchema } from '../user/user.schema';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongooseInMemory';
import { BlockSchema } from './block.schema';
import { BlockService } from './block.service';
import { Types } from 'mongoose';
import { FollowService } from '../follow/follow.service';
import { FollowSchema } from '../follow/follow.schema';

describe('BlockService', () => {
  let service: BlockService;
  let module: TestingModule;
  let id1: Types.ObjectId;
  let id2: Types.ObjectId;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'Block', schema: BlockSchema },
          { name: 'User', schema: UserSchema },
          { name: 'Follow', schema: FollowSchema },
        ]),
      ],
      providers: [FollowService, BlockService, UserService],
    }).compile();
    service = module.get<BlockService>(BlockService);
    const userService: UserService = module.get<UserService>(UserService);
    id1 = (
      await userService.createUser({
        age: 10,
        email: 'email@example.com',
        password: '12345678',
        username: 'username',
      })
    )._id;
    id2 = (
      await userService.createUser({
        age: 10,
        email: 'email2@example.com',
        password: '12345678',
        username: 'username2',
      })
    )._id;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('block', () => {
    it('should block successfully', async () => {
      const blockRes = await service.block({
        blocker: id1,
        blocked: id2,
      });
      expect(blockRes).toEqual({ status: 'success' });
    });
    it('should give duplicate error', async () => {
      await expect(async () => {
        await service.block({
          blocker: id1,
          blocked: id2,
        });
      }).rejects.toThrow(
        `user with id : ${id1.toString()} is already blocking user with id : ${id2.toString()}`,
      );
    });
    it('should give error because blocking myself', async () => {
      await expect(async () => {
        await service.block({
          blocker: id1,
          blocked: id1,
        });
      }).rejects.toThrow(`you are not allowed to block yourself`);
    });
  });
  describe('unblock', () => {
    it('should unblock successfully', async () => {
      const unblockRes = await service.unblock({
        blocker: id1,
        blocked: id2,
      });
      expect(unblockRes).toEqual({ status: 'success' });
    });
    it('should give error', async () => {
      await expect(async () => {
        await service.unblock({
          blocker: id1,
          blocked: id1,
        });
      }).rejects.toThrow(
        `user with id : ${id1.toString()} is not blocking user with id : ${id1.toString()}`,
      );
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    module.close();
  });
});

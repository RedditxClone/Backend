import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Types } from 'mongoose';

import { FollowSchema } from '../follow/follow.schema';
import { FollowService } from '../follow/follow.service';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { BlockSchema } from './block.schema';
import { BlockService } from './block.service';

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
    const user1 = await userService.createUser({
      email: 'email@example.com',
      password: '12345678',
      username: 'username',
    });
    id1 = user1._id;
    const user2 = await userService.createUser({
      email: 'email2@example.com',
      password: '12345678',
      username: 'username2',
    });
    id2 = user2._id;
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
  describe('getBlockedUsers', () => {
    it('should return blocked users successfully', async () => {
      const res = await service.getBlockedUsers(id1);
      expect(res.length).toEqual(1);
      expect(res[0].blocked).toEqual(
        expect.objectContaining({
          _id: id2,
          username: 'username2',
          profilePhoto: '',
        }),
      );
    });
    it('should return an empty array', async () => {
      const res = await service.getBlockedUsers(id2);
      expect(res.length).toEqual(0);
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
    await module.close();
  });
});

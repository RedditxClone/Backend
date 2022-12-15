import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Types } from 'mongoose';

import { BlockSchema } from '../block/block.schema';
import { BlockService } from '../block/block.service';
import { NotificationModule } from '../notification/notification.module';
import { PostCommentModule } from '../post-comment/post-comment.module';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { FollowSchema } from './follow.schema';
import { FollowService } from './follow.service';

describe('FollowService', () => {
  let service: FollowService;
  let module: TestingModule;
  let id1: Types.ObjectId;
  let id2: Types.ObjectId;
  let id3: Types.ObjectId;
  let user1;
  let user2;
  let user3;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        NotificationModule,
        PostCommentModule,
        ImagesHandlerModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'Follow', schema: FollowSchema },
          { name: 'User', schema: UserSchema },
          { name: 'Block', schema: BlockSchema },
        ]),
      ],
      providers: [FollowService, UserService, BlockService, ApiFeaturesService],
    }).compile();
    service = module.get<FollowService>(FollowService);
    const userService: UserService = module.get<UserService>(UserService);
    user1 = await userService.createUser({
      email: 'email@example.com',
      password: '12345678',
      username: 'username',
    });
    id1 = user1._id;
    user2 = await userService.createUser({
      email: 'email2@example.com',
      password: '12345678',
      username: 'username2',
    });
    id2 = user2._id;
    user3 = await userService.createUser({
      email: 'email3@example.com',
      password: '12345678',
      username: 'username3',
    });
    id3 = user3._id;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('follow', () => {
    it('should follow successfully', async () => {
      const followRes = await service.follow({
        follower: id1,
        followed: id2,
      });
      expect(followRes).toEqual({ status: 'success' });
    });
    it('should give duplicate error', async () => {
      await expect(async () => {
        await service.follow({
          follower: id1,
          followed: id2,
        });
      }).rejects.toThrow(
        `user with id : ${id1.toString()} is already following user with id : ${id2.toString()}`,
      );
    });
    it('should give error because following myself', async () => {
      await expect(async () => {
        await service.follow({
          follower: id1,
          followed: id1,
        });
      }).rejects.toThrow(`you are not allowed to follow yourself`);
    });
  });
  describe('unfollow', () => {
    it('should unfollow successfully', async () => {
      const unfollowRes = await service.unfollow({
        follower: id1,
        followed: id2,
      });
      expect(unfollowRes).toEqual({ status: 'success' });
    });
    it('should give error', async () => {
      await expect(async () => {
        await service.unfollow({
          follower: id1,
          followed: id1,
        });
      }).rejects.toThrow(
        `user with id : ${id1.toString()} is not following user with id : ${id1.toString()}`,
      );
    });
  });

  describe('get following list', () => {
    it('should return list of users following', async () => {
      await service.follow({
        follower: id1,
        followed: id2,
      });
      await service.follow({
        follower: id1,
        followed: id3,
      });
      const findRes1 = await service.getFollowingUsers(id1, {
        page: 1,
        limit: 2,
      });
      expect(findRes1.data).toEqual([
        { _id: id2, username: user2.username, profilePhoto: '' },
        { _id: id3, username: user3.username, profilePhoto: '' },
      ]);

      const findRes3 = await service.getFollowingUsers(id3, {
        page: 1,
        limit: 2,
      });

      expect(findRes3.data).toHaveLength(0);
    });
  });

  describe('get followed list', () => {
    it('should return list of users followed', async () => {
      const findRes1 = await service.getFollowedUsers(id2, {
        page: 1,
        limit: 2,
      });
      expect(findRes1.data).toEqual([
        { _id: id1, username: user1.username, profilePhoto: '' },
      ]);

      const findRes3 = await service.getFollowedUsers(id1, {
        page: 1,
        limit: 2,
      });

      expect(findRes3.data).toHaveLength(0);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

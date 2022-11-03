import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { UserSchema } from '../user/user.schema';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongooseInMemory';
import { FollowSchema } from './follow.schema';
import { FollowService } from './follow.service';
import { Types } from 'mongoose';

describe('FollowService', () => {
  let service: FollowService;
  let module: TestingModule;
  let id1: Types.ObjectId;
  let id2: Types.ObjectId;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'Follow', schema: FollowSchema },
          { name: 'User', schema: UserSchema },
        ]),
      ],
      providers: [FollowService, UserService],
    }).compile();
    service = module.get<FollowService>(FollowService);
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
  afterAll(async () => {
    await closeInMongodConnection();
    module.close();
  });
});

import { BadRequestException } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { UserStrategy } from '../auth/strategies/user.strategy';
import { BlockModule } from '../block/block.module';
import { BlockService } from '../block/block.service';
import { FollowModule } from '../follow/follow.module';
import { PostCommentModule } from '../post-comment/post-comment.module';
import { SubredditSchema } from '../subreddit/subreddit.schema';
import { SubredditService } from '../subreddit/subreddit.service';
import { SubredditUserSchema } from '../subreddit/subreddit-user.schema';
import type { CreateUserDto } from '../user/dto';
import type { UserDocument } from '../user/user.schema';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { PaginatedResponseDto } from '../utils/apiFeatures/dto';
import { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { NotificationModule } from './notification.module';
import { NotificationService } from './notification.service';

jest.mock('../follow/follow.service.ts');
jest.mock('../block/block.service.ts');
jest.mock('../utils/imagesHandler/images-handler.service');
describe('NotificationService', () => {
  let service: NotificationService;
  let userService: UserService;
  let module: TestingModule;
  let id2;
  const userDto: CreateUserDto = {
    username: 'omarfareed',
    password: '12345678',
    email: 'email@example.com',
  };
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        NotificationModule,
        rootMongooseTestModule(),
        FollowModule,
        BlockModule,
        PostCommentModule,
        ImagesHandlerModule,
        MongooseModule.forFeature([
          { name: 'Subreddit', schema: SubredditSchema },
          { name: 'UserSubreddit', schema: SubredditUserSchema },
          { name: 'User', schema: UserSchema },
        ]),
      ],
      providers: [
        UserService,
        UserStrategy,
        ApiFeaturesService,
        SubredditService,
        BlockService,
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    userService = module.get<UserService>(UserService);
    const user: UserDocument = await userService.createUser(userDto);
    id2 = user._id;
    await service.notifyOnReplies(id2, id2, 'post', 'folan1', 'folan2', id2);
    await service.notifyOnVotes(id2, id2, 'post', 'folan1', id2);
    await service.notifyOnFollow(id2, id2, id2, 'folan1');
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('notifyOnFollow spec', () => {
    const id = new Types.ObjectId(1);
    it('should pass', async () => {
      const res: any = await service.notifyOnFollow(id2, id, id, 'folan');
      expect(res.body).toEqual('u/folan started following you.');
      expect(res.type).toEqual('follow');
    });
  });
  describe('notifyOnVotes spec', () => {
    const id = new Types.ObjectId(1);
    it('should pass', async () => {
      const res: any = await service.notifyOnVotes(
        id2,
        id2,
        'post',
        'folan1',
        id2,
      );
      expect(res.body).toEqual('You got an upvote on your post in r/folan1');
      expect(res.type).toEqual('post_vote');
    });
    it('should pass', async () => {
      const res: any = await service.notifyOnVotes(
        id2,
        id,
        'comment',
        'folan',
        id,
      );
      expect(res.body).toEqual('You got an upvote on your comment in r/folan');
      expect(res.type).toEqual('comment_vote');
    });
  });
  describe('notifyOnReplies spec', () => {
    const id = new Types.ObjectId(1);
    it('should pass', async () => {
      const res: any = await service.notifyOnReplies(
        id2,
        id,
        'post',
        'folan1',
        'folan2',
        id,
      );
      expect(res.body).toEqual('u/folan2 replied to your post in r/folan1');
      expect(res.type).toEqual('post_reply');
    });
    it('should pass', async () => {
      const res: any = await service.notifyOnReplies(
        id2,
        id,
        'comment',
        'folan1',
        'folan2',
        id,
      );
      expect(res.body).toEqual('u/folan2 replied to your comment in r/folan1');
      expect(res.type).toEqual('comment_reply');
    });
  });
  describe('notifyOnReplies spec', () => {
    const id = new Types.ObjectId(1);
    it('should pass', async () => {
      const res: any = await service.notifyOnReplies(
        id2,
        id2,
        'post',
        'folan1',
        'folan2',
        id2,
      );
      expect(res.body).toEqual('u/folan2 replied to your post in r/folan1');
      expect(res.type).toEqual('post_reply');
    });
    it('should pass', async () => {
      const res: any = await service.notifyOnReplies(
        id2,
        id,
        'comment',
        'folan1',
        'folan2',
        id,
      );
      expect(res.body).toEqual('u/folan2 replied to your comment in r/folan1');
      expect(res.type).toEqual('comment_reply');
    });
  });
  describe('get count spec', () => {
    it('should pass', async () => {
      const res = await service.countNew(id2);
      expect(res.count).toEqual(9);
    });
  });
  describe('get notifications spec', () => {
    it('should pass', async () => {
      const res = await service.findAll(id2, new PaginationParamsDto());
      expect(res.data.length).toEqual(9);
      expect(res.data[0].body).toEqual(
        'u/folan2 replied to your post in r/folan1',
      );
      expect(res.data[1].body).toEqual(
        'You got an upvote on your post in r/folan1',
      );
      expect(res.data[2].body).toEqual('u/folan1 started following you.');
    });
  });
  describe('mark notifications hidden', () => {
    let res: PaginatedResponseDto;
    beforeAll(async () => {
      res = await service.findAll(id2, new PaginationParamsDto());
    });
    it('should throw because post id is not found', async () => {
      await expect(async () => {
        await service.hide(id2, id2);
      }).rejects.toThrow(BadRequestException);
    });
    it('should throw because user is not the same', async () => {
      await expect(async () => {
        await service.hide(new Types.ObjectId(123), res.data[0]._id);
      }).rejects.toThrow(BadRequestException);
    });

    it('should pass', async () => {
      const res1 = await service.hide(id2, res.data[0]._id);
      expect(res1.status).toEqual('success');
    });
  });
  describe('getprefs', () => {
    it('should throw', async () => {
      await expect(async () => {
        await service.skipNotify(new Types.ObjectId(1234));
      }).rejects.toThrow(BadRequestException);
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

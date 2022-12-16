import { HttpStatus } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { Types } from 'mongoose';
import { createResponse } from 'node-mocks-http';

import { UserStrategy } from '../auth/strategies/user.strategy';
import { BlockModule } from '../block/block.module';
import { BlockService } from '../block/block.service';
import { stubBlock } from '../block/test/stubs/blocked-users.stub';
import { FollowModule } from '../follow/follow.module';
import type { Post } from '../post/post.schema';
import { PostService } from '../post/post.service';
import { PostCommentModule } from '../post-comment/post-comment.module';
import type { SubredditDocument } from '../subreddit/subreddit.schema';
import { SubredditSchema } from '../subreddit/subreddit.schema';
import { SubredditService } from '../subreddit/subreddit.service';
import { SubredditUserSchema } from '../subreddit/subreddit-user.schema';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import { stubImagesHandler } from '../utils/imagesHandler/test/stubs/image-handler.stub';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import type { CreateUserDto } from './dto';
import { PrefsDto } from './dto';
import { stubUser } from './test/stubs/user.stub';
import type { UserDocument } from './user.schema';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';

jest.mock('../follow/follow.service.ts');
jest.mock('../block/block.service.ts');
jest.mock('../utils/imagesHandler/images-handler.service');
describe('UserService', () => {
  let service: UserService;
  let postService: PostService;
  let subredditService: SubredditService;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        FollowModule,
        BlockModule,
        PostCommentModule,
        ImagesHandlerModule,
        rootMongooseTestModule(),
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
    service = module.get<UserService>(UserService);
    postService = module.get<PostService>(PostService);
    subredditService = module.get<SubredditService>(SubredditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(postService).toBeDefined();
    expect(subredditService).toBeDefined();
  });

  let id: Types.ObjectId;
  const userDto: CreateUserDto = {
    username: 'omarfareed',
    password: '12345678',
    email: 'email@example.com',
  };
  describe('validPassword', () => {
    const usedPass = '12345678';
    const unusedPass = '213492442';
    let hashed: string;
    it('should be valid', async () => {
      hashed = await bcrypt.hash(usedPass, await bcrypt.genSalt(10));
      const validPassword: boolean = await bcrypt.compare(usedPass, hashed);
      expect(validPassword).toBe(true);
    });
    it("shouldn't be valid", async () => {
      const validPassword: boolean = await bcrypt.compare(unusedPass, hashed);
      expect(validPassword).not.toBe(true);
    });
  });
  describe('createUser', () => {
    test('should create user successfully', async () => {
      const user: UserDocument = await service.createUser(userDto);
      expect(user).toEqual(
        expect.objectContaining({
          username: userDto.username,
          email: userDto.email,
        }),
      );
      id = user._id;
    });
    test('should throw an error', async () => {
      const dto: any = {
        username: 'username',
        password: 'password',
      };
      await expect(async () => {
        await service.createUser(dto);
      }).rejects.toThrowError();
    });
    test('should throw duplicate error', async () => {
      const dto: CreateUserDto = {
        username: 'omarfareed',
        password: '12345678',
        email: 'email@example.com',
      };
      await expect(async () => service.createUser(dto)).rejects.toThrow(
        /.*duplicate.*/,
      );
    });
  });
  describe('getUserById', () => {
    test('should get a user', async () => {
      const user: UserDocument = await service.getUserById(id, true);
      expect(user).toEqual(
        expect.objectContaining({
          username: userDto.username,
          email: userDto.email,
        }),
      );
      const passwordValid: boolean = await service.validPassword(
        userDto.password,
        user.hashPassword,
      );
      expect(passwordValid).toBe(true);
    });
    test('should throw an error', async () => {
      await expect(async () => {
        await service.getUserById(new Types.ObjectId('wrong_id'));
      }).rejects.toThrowError();
      await expect(async () => {
        await service.getUserById(new Types.ObjectId(10));
      }).rejects.toThrow(/.*there is no user.*/);
    });
  });
  describe('getUserInfo', () => {
    it('should return user successfully', async () => {
      const user: any = await service.getUserById(id);
      expect(user).toBeTruthy();
      const userAccount = service.getUserInfo(user);
      expect(userAccount).toEqual({
        username: userDto.username,
        profilePhoto: '',
        _id: id,
      });
    });
  });

  describe('generate random list', () => {
    it('should create 6 usernames', async () => {
      const list = await service.generateRandomUsernames(6);
      expect(list.length).toEqual(6);
    });
  });
  describe('getUserByUsername', () => {
    it('should get user', async () => {
      const user: UserDocument = await service.getUserByUsername(
        userDto.username,
        true,
      );
      expect(user).toEqual(
        expect.objectContaining({
          email: userDto.email,
          username: userDto.username,
        }),
      );
      const validPassword: boolean = await service.validPassword(
        userDto.password,
        user.hashPassword,
      );
      expect(validPassword).toBe(true);
    });
    it('should pass an error', async () => {
      await expect(async () => {
        await service.getUserByUsername('wrong_username');
      }).rejects.toThrow(
        `no user with information {"username":"wrong_username"}`,
      );
    });
  });
  describe('checkAvailableUsername', () => {
    it('should return 201', async () => {
      const res = createResponse();
      await service.checkAvailableUsername({ username: 'notTaken' }, res);
      expect(res._getStatusCode()).toEqual(HttpStatus.CREATED);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ status: true }),
      );
    });
    it('should return 401', async () => {
      const res = createResponse();
      await service.checkAvailableUsername({ username: 'omarfareed' }, res);
      expect(res._getStatusCode()).toEqual(HttpStatus.UNAUTHORIZED);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ status: false }),
      );
    });
  });
  describe('follow', () => {
    it('should follow successfully', async () => {
      const res: any = await service.follow(id, id);
      expect(res).toEqual({ status: 'success' });
    });
    const wrongId: Types.ObjectId = new Types.ObjectId('wrong_id____');
    it('should pass wrong id error', async () => {
      await expect(async () => {
        await service.follow(id, wrongId);
      }).rejects.toThrow(`there is no user with id : ${wrongId.toString()}`);
    });
  });
  describe('unfollow', () => {
    it('should unfollow successfully', async () => {
      const res: any = await service.unfollow(id, id);
      expect(res).toEqual({ status: 'success' });
    });
  });

  describe('updatePrefsSpec', () => {
    it('should update succesfully', async () => {
      const res: any = await service.updateUserPrefs(
        id,
        plainToClass(PrefsDto, stubUser()),
      );
      expect(res).toEqual({ status: 'success' });
    });
  });
  describe('getPrefsSpec', () => {
    it('should get succesfully', async () => {
      const prefs: PrefsDto = { countryCode: 'eg' };
      const user = plainToClass(PrefsDto, stubUser());
      const res1: PrefsDto = await service.getUserPrefs(id);
      expect(res1).toEqual(expect.objectContaining(user));
      user.countryCode = 'eg';
      await service.updateUserPrefs(id, prefs);
      const res2: PrefsDto = await service.getUserPrefs(id);
      expect(res2).toEqual(expect.objectContaining({ ...user }));
    });
    it('should fail', async () => {
      const prefs: PrefsDto = { countryCode: 'eg', allowFollow: false };
      const user = plainToClass(PrefsDto, stubUser());
      user.countryCode = 'eg';
      await service.updateUserPrefs(id, prefs);
      const res2: PrefsDto = await service.getUserPrefs(id);
      expect(res2).not.toEqual(expect.objectContaining({ ...user }));
    });
  });

  describe('block', () => {
    it('should block successfully', async () => {
      const res: any = await service.block(id, id);
      expect(res).toEqual({ status: 'success' });
    });
    const wrongId: Types.ObjectId = new Types.ObjectId('wrong_id____');
    it('should pass wrong id error', async () => {
      await expect(async () => {
        await service.block(id, wrongId);
      }).rejects.toThrow(`there is no user with id : ${wrongId.toString()}`);
    });
  });

  describe('getBlockedUsers', () => {
    it('should return blocked users successfully', async () => {
      const res: any = await service.getBlockedUsers(id);
      expect(res).toEqual(stubBlock());
    });
  });
  describe('unblock', () => {
    it('should unblock successfully', async () => {
      const res: any = await service.unblock(id, id);
      expect(res).toEqual({ status: 'success' });
    });
  });
  let adminId: Types.ObjectId;
  describe('make-admin', () => {
    beforeAll(async () => {
      const admin: UserDocument = await service.createUser({
        ...userDto,
        email: 'anotherEmail@exmaple.com',
        username: 'anotherusername',
      });
      adminId = admin._id;
    });
    it('should be admin', async () => {
      const res: any = await service.makeAdmin(adminId);
      expect(res).toEqual({ status: 'success' });
    });
    // to make sure that it has been changed inside database
    it('must be changed inside database', async () => {
      const user: UserDocument = await service.getUserById(adminId);
      expect(user.authType).toEqual('admin');
    });
    it('should throw bad exception', async () => {
      const wrongId: Types.ObjectId = new Types.ObjectId('wrong_id____');
      await expect(async () => {
        await service.makeAdmin(wrongId);
      }).rejects.toThrow(`there is no user with id ${wrongId}`);
    });
  });
  let moderatorId: Types.ObjectId;
  describe('grant moderation', () => {
    beforeAll(async () => {
      const moderator: UserDocument = await service.createUser({
        ...userDto,
        email: `moderator${userDto.email}`,
        username: `moderator${userDto.username}`,
      });
      moderatorId = moderator._id;
    });
    it('should be a moderator', async () => {
      const res: any = await service.allowUserToBeModerator(moderatorId);
      expect(res).toEqual({ status: 'success' });
    });
    it('must be changed inside database', async () => {
      const user: UserDocument = await service.getUserById(moderatorId);
      expect(user.authType).toEqual('moderator');
    });
    it('must throw an error because of being admin', async () => {
      await expect(async () => {
        await service.allowUserToBeModerator(adminId);
      }).rejects.toThrow(
        `you are not allowed to change the role of the admin through this endpoint`,
      );
    });
    it('must be wrong id', async () => {
      const wrongId = new Types.ObjectId('wrong_id____');
      await expect(async () => {
        await service.allowUserToBeModerator(wrongId);
      }).rejects.toThrow(`there is no user with id ${wrongId}`);
    });
  });
  describe('change password', () => {
    it('should change password successfully', async () => {
      await expect(
        service.changePassword(id, 'new password'),
      ).resolves.not.toThrowError();
    });
    it('should throw error due to wrong id', async () => {
      const wrongId = new Types.ObjectId(10);
      await expect(service.changePassword(wrongId, 'password')).rejects.toThrow(
        `there is no user with id ${wrongId}`,
      );
    });
  });
  describe('Delete user by setting the accountClosed to true', () => {
    it('should close the account successfully', async () => {
      const user = { _id: id };
      expect(await service.deleteAccount(user)).toEqual({
        status: 'success',
      });
    });
  });

  describe('Save a post', () => {
    it('should save the post successfully', async () => {
      expect(await service.savePost(id, id)).toEqual({
        status: 'success',
      });
    });
    it('should save the post successfully', async () => {
      try {
        await service.savePost(id, id);
      } catch (error) {
        expect(error.message).toBe('the post already saved');
      }
    });
  });

  describe('get saved posts', () => {
    let user1: UserDocument;
    let user2: UserDocument;
    const subreddits: SubredditDocument[] = [];
    const posts: Array<Post & { _id: Types.ObjectId }> = [];
    beforeAll(async () => {
      user1 = await service.createUser({
        email: 'email@gmail.com',
        username: 'username',
        password: '12345678',
      });
      user2 = await service.createUser({
        email: 'email@gmail.com',
        username: 'username2',
        password: '12345678',
      });
      const sr1 = await subredditService.create(
        {
          name: 'sr1',
          over18: true,
          type: 'type',
        },
        user1.username,
        user1._id,
      );
      const sr2 = await subredditService.create(
        {
          name: 'sr2',
          over18: true,
          type: 'type',
        },
        user1.username,
        user1._id,
      );
      subreddits.push(sr1, sr2);

      await subredditService.joinSubreddit(user1._id, sr1._id);
      await subredditService.joinSubreddit(user1._id, sr2._id);

      const post1 = await postService.create(user2._id, {
        title: 'post1 title',
        text: 'post1 text',
        subredditId: sr1._id,
      });
      const post2 = await postService.create(user2._id, {
        title: 'post2 title',
        text: 'post2 text',
        subredditId: sr2._id,
      });

      posts.push(post1, post2);
      user1.savedPosts = [post1._id, post2._id];
      await user1.save();
    });
    it('should return 2 posts successfully', async () => {
      const res = await service.getSavedPosts(
        user1._id,
        new PaginationParamsDto(),
      );
      expect(res.length).toEqual(2);
      expect(res[0]).toEqual(
        expect.objectContaining({
          _id: posts[0]._id,
          text: posts[0].text,
          title: posts[0].title,
          voteType: null,
          subredditInfo: {
            id: subreddits[0]._id,
            name: subreddits[0].name,
          },
          user: {
            id: user2._id,
            photo: '',
            username: user2.username,
          },
        }),
      );
    });
  });

  describe('uploadIcon', () => {
    it('should upload the icon successfully', async () => {
      expect(
        await service.uploadPhoto(id, { buffer: null }, 'profilePhoto'),
      ).toEqual(stubImagesHandler());
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

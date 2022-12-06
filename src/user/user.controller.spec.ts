import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { createRequest, createResponse } from 'node-mocks-http';

import { stubBlock } from '../block/test/stubs/blocked-users.stub';
import type { AvailableUsernameDto } from './dto';
import { PrefsDto } from './dto';
import { stubUser } from './test/stubs/user.stub';
import { UserController } from './user.controller';
import type { UserDocument } from './user.schema';
import { UserService } from './user.service';

jest.mock('./user.service');
describe('UserControllerSpec', () => {
  let userController: UserController;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();
    userController = moduleRef.get<UserController>(UserController);
    jest.clearAllMocks();
  });
  test('it should be defined', () => {
    expect(userController).toBeDefined();
  });
  describe('getUserByIdSpec', () => {
    test('it should return a user', async () => {
      const id: Types.ObjectId = new Types.ObjectId(1);
      const user: UserDocument = await userController.getUserById(id);
      expect(user).toEqual(stubUser());
    });
  });
  describe('availableUsernameSpec', () => {
    it('should run without problems', async () => {
      const availableUsernameDto: AvailableUsernameDto = { username: 'test' };
      const res = createResponse();
      const val = await userController.checkAvailableUsername(
        availableUsernameDto,
        res,
      );
      expect(val).toEqual({ status: true });
    });
  });

  describe('follow', () => {
    test('it should follow successfully', async () => {
      const req = createRequest();
      const id: Types.ObjectId = new Types.ObjectId('exampleOfId1');
      req.user = { id };
      const res: any = await userController.followUser(id, req);
      expect(res).toEqual({ status: 'success' });
    });
  });
  describe('unfollow', () => {
    test('it should unfollow successfully', async () => {
      const req = createRequest();
      const id: Types.ObjectId = new Types.ObjectId('exampleOfId1');
      req.user = { id };
      const res: any = await userController.unfollowUser(id, req);
      expect(res).toEqual({ status: 'success' });
    });
  });
  describe('block', () => {
    test('it should block successfully', async () => {
      const req = createRequest();
      const id: Types.ObjectId = new Types.ObjectId('exampleOfId1');
      req.user = { id };
      const res: any = await userController.blockUser(id, req);
      expect(res).toEqual({ status: 'success' });
    });
  });

  describe('block', () => {
    test('it should block successfully', async () => {
      const req = createRequest();
      const id: Types.ObjectId = new Types.ObjectId('exampleOfId1');
      req.user = { id };
      const res: any = await userController.getBlockedUsers({
        user: { _id: id },
      });
      expect(res).toEqual(stubBlock());
    });
  });
  describe('unblock', () => {
    test('it should unblock successfully', async () => {
      const req = createRequest();
      const id: Types.ObjectId = new Types.ObjectId('exampleOfId1');
      req.user = { id };
      const res: any = await userController.unblockUser(id, req);
      expect(res).toEqual({ status: 'success' });
    });
  });
  describe('make moderator', () => {
    it('must be created successfully', async () => {
      const id: Types.ObjectId = new Types.ObjectId('exampleOfId1');
      const res: any = await userController.makeModeration(id);
      expect(res).toEqual({ ...stubUser(), authType: 'moderator' });
    });
  });
  describe('make admin', () => {
    it('must be created successfully', async () => {
      const id: Types.ObjectId = new Types.ObjectId('exampleOfId1');
      const res: any = await userController.makeAdmin(id);
      expect(res).toEqual({ ...stubUser(), authType: 'admin' });
    });
  });
  describe('get prefs', () => {
    it('must be returned successfully', async () => {
      const req = createRequest();
      const id: Types.ObjectId = new Types.ObjectId('exampleOfId1');
      req.user = { id };
      const res: any = await userController.getUserPrefs(req);
      const {
        username: _username,
        email: _email,
        authType: _authType,
        hashPassword: _hashPassword,
        savedPosts: _savedPosts,
        ...user
      } = stubUser();
      expect(res).toEqual(user);
    });
  });
  describe('patch prefs', () => {
    it('must be patched successfully', async () => {
      const req = createRequest();
      const id: Types.ObjectId = new Types.ObjectId('exampleOfId1');
      req.user = { id };
      const res: any = await userController.updateUserPrefs(
        req,
        new PrefsDto(),
      );
      expect(res).toEqual({ status: 'success' });
    });
  });
  describe('Delete user', () => {
    it('must be deleted successfully', async () => {
      const req = createRequest();
      const id: Types.ObjectId = new Types.ObjectId(1);
      req.user = { id };
      expect(await userController.deleteAccount(req)).toEqual({
        status: 'success',
      });
    });
  });
  describe('upload profile photo', () => {
    it('must be uploaded successfully', async () => {
      const req = createRequest();
      const _id: Types.ObjectId = new Types.ObjectId(1);
      req.user = { _id };
      expect(await userController.uploadProfilePhoto(req, null)).toEqual({
        photo: 'statics/somefolder/636c31ef6b71bf1c6226a5a4.jpeg',
      });
    });
  });

  describe('upload cover photo', () => {
    it('must be uploaded successfully', async () => {
      const req = createRequest();
      const _id: Types.ObjectId = new Types.ObjectId(1);
      req.user = { _id };
      expect(await userController.uploadCoverPhoto(req, null)).toEqual({
        photo: 'statics/somefolder/636c31ef6b71bf1c6226a5a4.jpeg',
      });
    });
  });
  describe('save post', () => {
    it('must be saved successfully', async () => {
      const id1: Types.ObjectId = new Types.ObjectId(1);
      const id2: Types.ObjectId = new Types.ObjectId(2);
      const user = { _id: id1 };
      const params = { _id: id2 };
      const res: any = await userController.savePost({ user, params });
      expect(res).toEqual({ status: 'success' });
    });
  });

  describe('get saved post', () => {
    it('must be returned successfully', async () => {
      const id1: Types.ObjectId = new Types.ObjectId(1);
      const user = { _id: id1 };
      const res: any = await userController.getSavedPosts({ user });
      expect(res).toEqual({
        _id: '6366f73606cdac163ace51b1',
        savedPosts: ['636a7faa18454a10a4791426'],
      });
    });
  });
});

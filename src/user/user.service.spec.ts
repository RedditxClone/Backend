import { HttpStatus } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { Types } from 'mongoose';
import { createResponse } from 'node-mocks-http';

import { UserStrategy } from '../auth/stratigies/user.strategy';
import { BlockModule } from '../block/block.module';
import { stubBlock } from '../block/test/stubs/blocked-users.stub';
import { FollowModule } from '../follow/follow.module';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
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
describe('UserService', () => {
  let service: UserService;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        FollowModule,
        BlockModule,
        ImagesHandlerModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      ],
      providers: [UserService, UserStrategy],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      const user: UserDocument = await service.makeAdmin(adminId);
      expect(user.authType).toEqual('admin');
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
      const user: UserDocument = await service.allowUserToBeModerator(
        moderatorId,
      );
      expect(user.authType).toEqual('moderator');
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
  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

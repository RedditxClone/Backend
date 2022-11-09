import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongooseInMemory';
import { CreateUserDto, PrefsDto } from './dto';
import { UserDocument, UserSchema } from './user.schema';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { createResponse } from 'node-mocks-http';
import { HttpStatus } from '@nestjs/common';
import { FollowModule } from '../follow/follow.module';
import { UserStrategy } from '../auth/stratigies/user.strategy';
import { ConfigModule } from '@nestjs/config';
import { stubUser } from './test/stubs/user.stub';
import { plainToClass } from 'class-transformer';
import { BlockModule } from '../block/block.module';

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
  const dto: CreateUserDto = {
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
      const user: UserDocument = await service.createUser(dto);
      expect(user).toEqual(
        expect.objectContaining({
          username: dto.username,
          email: dto.email,
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
      await expect(async () => await service.createUser(dto)).rejects.toThrow(
        /.*duplicate.*/,
      );
    });
  });
  describe('getUserById', () => {
    test('should get a user', async () => {
      const user: UserDocument = await service.getUserById(id);
      expect(user).toEqual(
        expect.objectContaining({
          username: dto.username,
          email: dto.email,
        }),
      );
      const passwordValid: boolean = await service.validPassword(
        dto.password,
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
  describe('getUserByEmail', () => {
    it('should get user', async () => {
      const user: UserDocument = await service.getUserByEmail(dto.email);
      expect(user).toEqual(
        expect.objectContaining({
          email: dto.email,
          username: dto.username,
        }),
      );
      const validPassword: boolean = await service.validPassword(
        dto.password,
        user.hashPassword,
      );
      expect(validPassword).toBe(true);
    });
    it('should pass an error', async () => {
      await expect(async () => {
        await service.getUserByEmail('wrong_email@gmail.com');
      }).rejects.toThrow(
        `no user with information {"email":"wrong_email@gmail.com"}`,
      );
    });
  });
  describe('getUserByUsername', () => {
    it('should get user', async () => {
      const user: UserDocument = await service.getUserByUsername(dto.username);
      expect(user).toEqual(
        expect.objectContaining({
          email: dto.email,
          username: dto.username,
        }),
      );
      const validPassword: boolean = await service.validPassword(
        dto.password,
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
    const wrong_id: Types.ObjectId = new Types.ObjectId('wrong_id____');
    it('should pass wrong id error', async () => {
      await expect(async () => {
        await service.follow(id, wrong_id);
      }).rejects.toThrow(`there is no user with id : ${wrong_id.toString()}`);
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
    const wrong_id: Types.ObjectId = new Types.ObjectId('wrong_id____');
    it('should pass wrong id error', async () => {
      await expect(async () => {
        await service.block(id, wrong_id);
      }).rejects.toThrow(`there is no user with id : ${wrong_id.toString()}`);
    });
  });
  describe('unblock', () => {
    it('should unblock successfully', async () => {
      const res: any = await service.unblock(id, id);
      expect(res).toEqual({ status: 'success' });
    });
  });
  let admin_id: Types.ObjectId;
  describe('make-admin', () => {
    beforeAll(async () => {
      const admin: UserDocument = await service.createUser({
        ...dto,
        email: 'anotherEmail@exmaple.com',
        username: 'anotherusername',
      });
      admin_id = admin._id;
    });
    it('should be admin', async () => {
      const user: UserDocument = await service.makeAdmin(admin_id);
      expect(user.authType).toEqual('admin');
    });
    // to make sure that it has been changed inside database
    it('must be changed inside database', async () => {
      const user: UserDocument = await service.getUserById(admin_id);
      expect(user.authType).toEqual('admin');
    });
    it('should throw bad exception', async () => {
      const wrong_id: Types.ObjectId = new Types.ObjectId('wrong_id____');
      await expect(async () => {
        await service.makeAdmin(wrong_id);
      }).rejects.toThrow(`there is no user with id ${wrong_id}`);
    });
  });
  let moderator_id: Types.ObjectId;
  describe('grant moderation', () => {
    beforeAll(async () => {
      const moderator: UserDocument = await service.createUser({
        ...dto,
        email: `moderator${dto.email}`,
        username: `moderator${dto.username}`,
      });
      moderator_id = moderator._id;
    });
    it('should be a moderator', async () => {
      const user: UserDocument = await service.allowUserToBeModerator(
        moderator_id,
      );
      expect(user.authType).toEqual('moderator');
    });
    it('must be changed inside database', async () => {
      const user: UserDocument = await service.getUserById(moderator_id);
      expect(user.authType).toEqual('moderator');
    });
    it('must throw an error because of being admin', async () => {
      await expect(async () => {
        await service.allowUserToBeModerator(admin_id);
      }).rejects.toThrow(
        `you are not allowed to change the role of the admin through this endpoint`,
      );
    });
    it('must be wrong id', async () => {
      const wrong_id = new Types.ObjectId('wrong_id____');
      await expect(async () => {
        await service.allowUserToBeModerator(wrong_id);
      }).rejects.toThrow(`there is no user with id ${wrong_id}`);
    });
  });
  describe('change password', () => {
    it('should change password successfully', async () => {
      await expect(
        service.changePassword(id, 'new password'),
      ).resolves.not.toThrowError();
    });
    it('should throw error due to wrong id', async () => {
      const wrong_id = new Types.ObjectId(10);
      await expect(
        service.changePassword(wrong_id, 'password'),
      ).rejects.toThrow(`there is no user with id ${wrong_id}`);
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
    it('should return saved posts successfully', async () => {
      expect(await service.getSavedPosts(id)).toEqual(
        expect.objectContaining({
          _id: id,
          savedPosts: [id],
        }),
      );
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    module.close();
  });
});

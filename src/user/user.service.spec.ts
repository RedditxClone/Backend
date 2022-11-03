import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from '../utils/mongooseInMemory';
import { CreateUserDto } from './dto';
import { UserDocument, UserSchema } from './user.schema';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      ],
      providers: [UserService],
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
    age: 10,
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
          age: dto.age,
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
        age: 10,
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
          age: dto.age,
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
      }).rejects.toThrow(/.*there is no user with id.*/);
    });
  });
  describe('getUserByEmail', () => {
    it('should get user', async () => {
      const user: UserDocument = await service.getUserByEmail(dto.email);
      expect(user).toEqual(
        expect.objectContaining({
          email: dto.email,
          username: dto.username,
          age: dto.age,
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
      }).rejects.toThrow(`no user with email wrong_email@gmail.com`);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    module.close();
  });
});

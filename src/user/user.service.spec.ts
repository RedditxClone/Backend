import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongooseInMemory';
import { CreateUserDto } from './dto';
import { UserDocument, UserSchema } from './user.schema';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

  let id;
  describe('createUser', () => {
    test('should create user successfully', async () => {
      const dto: CreateUserDto = {
        username: 'omarfareed',
        password: '12345678',
        age: 10,
        email: 'email@example.com',
      };
      const user: UserDocument = await service.createUser(dto);
      ['age', 'email', 'username'].forEach((field) =>
        expect(user[field]).toEqual(dto[field]),
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
      expect(user.email).toEqual('email@example.com');
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

  afterAll(async () => {
    await closeInMongodConnection();
  });
});

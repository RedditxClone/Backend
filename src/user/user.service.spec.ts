import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongooseInMemory';
import { stubUser } from './test/stubs/user.stub';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  beforeEach(async () => {
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

  describe('createUser', () => {
    test('should create one user', async () => {
      const user: User = await service.createUser({
        ...stubUser(),
        password: '12345678',
      });
      expect(user).toEqual(stubUser());
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});

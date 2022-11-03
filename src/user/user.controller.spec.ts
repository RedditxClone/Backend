import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { CreateUserDto } from './dto';
import { UserController } from './user.controller';
import { UserDocument } from './user.schema';
import { UserService } from './user.service';
import { stubUser } from './test/stubs/user.stub';
import { createRequest } from 'node-mocks-http';
import { JWTUserGuard } from '../auth/guards/user.guard';

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
});

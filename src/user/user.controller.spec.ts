<<<<<<< HEAD
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

||||||| ceebe63
import { Test, TestingModule } from '@nestjs/testing';
=======
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { CreateUserDto } from './dto';
>>>>>>> development
import { UserController } from './user.controller';
import { User, UserDocument } from './user.schema';
import { UserService } from './user.service';
import { stubUser } from './test/stubs/user.stub';

jest.mock('./user.service');
describe('UserControllerSpec', () => {
  let userController: UserController;
  let userService: UserService;
  const user1: CreateUserDto = {
    age: 10,
    email: 'email@example.com',
    password: '123456677',
    username: 'username1',
  };
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();
    userController = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
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
});

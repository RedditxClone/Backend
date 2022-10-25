import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { CreateUserDto } from './dto';
import { UserController } from './user.controller';
import { User } from './user.schema';
import { UserService } from './user.service';
import { stubUser } from './test/stubs/user.stub';

jest.mock('./user.service');
describe('UserControllerSpec', () => {
  let userController: UserController;
  let userService: UserService;
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
  describe('getUserSpec', () => {
    let user: User;
    let id: Types.ObjectId;
    beforeEach(async () => {
      // this is a valid mongo id
      id = new Types.ObjectId('6356d53a9d44def1dfe49555');
      user = await userController.getUser(id);
    });
    test('it must be called', () => {
      expect(userService.getUserById).toBeCalledWith(id);
    });
    test('it should return a user', () => {
      expect(user).toEqual(stubUser());
    });
  });
  describe('createUserSpec', () => {
    let user: User;
    let dto: CreateUserDto;
    beforeEach(async () => {
      dto = {
        email: stubUser().email,
        age: stubUser().age,
        password: stubUser().hashPassword,
        username: stubUser().username,
      };
      user = await userController.createUser(dto);
    });
    test('it must be called', () => {
      expect(userService.createUser).toBeCalledWith(dto);
    });
    test('it should return a user', () => {
      expect(user).toEqual(stubUser());
    });
  });
});

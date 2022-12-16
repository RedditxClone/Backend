import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Response } from 'express';
import { Types } from 'mongoose';
import { createRequest, createResponse } from 'node-mocks-http';

import type { CreateUserDto } from '../user/dto';
import { stubUser } from '../user/test/stubs/user.stub';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type {
  ChangeForgottenPasswordDto,
  ChangePasswordDto,
  ForgetPasswordDto,
  ForgetUsernameDto,
  LoginDto,
} from './dto';

jest.mock('./auth.service');
describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });
  describe('login', () => {
    it('should login successfully', async () => {
      const res: Response = createResponse();
      const dto: LoginDto = {
        username: 'username',
        password: '12345678',
      };
      const user: any = await controller.login(dto, res);
      const exp = stubUser();
      exp.createdAt = user.createdAt;
      expect(user).toEqual(exp);
    });
  });
  describe('signup', () => {
    it('should signup successfully ', async () => {
      const res: Response = createResponse();
      const dto: CreateUserDto = {
        email: 'email@example.com',
        password: '12345678',
        username: 'user1',
      };
      const user: any = await controller.signup(dto, res);
      const exp = stubUser();
      exp.createdAt = user.createdAt;
      expect(user).toEqual(exp);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('forget username', () => {
    it('should send successfully', async () => {
      const res: Response = createResponse();
      const dto: ForgetUsernameDto = {
        email: 'email@example.com',
      };
      const val = await controller.forgetUsername(dto, res);
      expect(val).toBeUndefined();
    });
  });

  describe('changePassword', () => {
    it('should send successfully', async () => {
      const res: Response = createResponse();
      const dto: ChangePasswordDto = {
        oldPassword: '123456789',
        newPassword: '12345678',
      };
      const userId = new Types.ObjectId(213);
      const val = await controller.changePassword(dto, res, userId);
      expect(val).not.toBeTruthy();
    });
  });
  describe('forget password', () => {
    it('should send an with the token successfully', async () => {
      const dto: ForgetPasswordDto = { username: 'someusername' };
      const res: any = await controller.forgetPassword(dto);
      expect(res).toEqual({ status: 'success' });
    });
  });
  describe('change forgotten password', () => {
    it('should change password successfully', async () => {
      const req: any = createRequest();
      const dto: ChangeForgottenPasswordDto = { password: '12345678' };
      // TODO:
      // there exist a type issue i can't use user._id if i used Request type as it uses Express.User type
      req.user = { _id: 1 };
      const res: any = await controller.changeForgottenPassword(dto, req);
      expect(res).toEqual({ status: 'success' });
    });
  });
});

<<<<<<< HEAD
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

||||||| ceebe63
import { Test, TestingModule } from '@nestjs/testing';
=======
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { createResponse } from 'node-mocks-http';
import { CreateUserDto } from 'src/user/dto';
import { stubUser } from '../user/test/stubs/user.stub';
>>>>>>> development
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ForgetUsernameDto, LoginDto } from './dto';

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
        email: 'email@example.com',
        password: '12345678',
      };
      const user = await controller.login(dto, res);
      expect(user).toEqual(stubUser());
    });
  });
  describe('signup', () => {
    it('should signup successfully ', async () => {
      const res: Response = createResponse();
      const dto: CreateUserDto = {
        email: 'email@example.com',
        password: '12345678',
        age: 10,
        username: 'user1',
      };
      const user = await controller.signup(dto, res);
      expect(user).toEqual(stubUser());
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
});

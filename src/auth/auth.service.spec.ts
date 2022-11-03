import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../user/dto';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongooseInMemory';
import { AuthService } from './auth.service';
import { createResponse } from 'node-mocks-http';
import { ConfigModule } from '@nestjs/config';
import { FollowModule } from '../follow/follow.module';
import { EmailService, EmailServiceMock } from '../utils';
import { HttpStatus } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '15d' },
        }),
        FollowModule,
      ],
      providers: [AuthService, UserService, EmailService],
    })
      .overrideProvider(EmailService)
      .useValue(EmailServiceMock)
      .compile();
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(authService).toBeDefined();
  });

  const user1: CreateUserDto = {
    age: 12,
    email: 'example@example.com',
    password: '12345678',
    username: 'test',
  };
  describe('signup', () => {
    it('should signup successfully', async () => {
      const res = createResponse();
      await authService.signup(user1, res);
      expect(res.cookies.authorization).toBeDefined();
      expect(res.cookies.authorization.value).toEqual(
        expect.stringMatching(/^Bearer /),
      );
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ status: 'success' }),
      );
    });
    it('should throw an error', async () => {
      const res = createResponse();
      await expect(async () => {
        await authService.signup(user1, res);
      }).rejects.toThrowError();
    });
  });
  describe('login', () => {
    it('should login successfully', async () => {
      const res = createResponse();
      await authService.login(
        { email: user1.email, password: user1.password },
        res,
      );
      expect(res.cookies.authorization).toBeDefined();
      expect(res.cookies.authorization.value).toEqual(
        expect.stringMatching(/^Bearer /),
      );
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ status: 'success' }),
      );
    });
    it("shouldn't login successfully", async () => {
      const res = createResponse();
      await expect(async () => {
        await authService.login(
          {
            email: user1.email,
            password: `${user1.password} `,
          },
          res,
        );
      }).rejects.toThrow('wrong email or password');
    });
  });

  describe('forget username', () => {
    it('should send mail successfully', async () => {
      const res = createResponse();
      await authService.forgetUsername(
        {
          email: user1.email,
        },
        res,
      );
      expect(res._getStatusCode()).toEqual(HttpStatus.CREATED);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ status: 'success' }),
      );
    });
    it('should fail sending mail', async () => {
      const res = createResponse();
      await authService.forgetUsername(
        {
          email: 'throw',
        },
        res,
      );
      expect(res._getStatusCode()).toEqual(HttpStatus.UNAUTHORIZED);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ status: "couldn't send message" }),
      );
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    module.close();
  });
});

import { HttpStatus } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { createResponse } from 'node-mocks-http';

import { BlockModule } from '../block/block.module';
import { FollowModule } from '../follow/follow.module';
import { MessageModule } from '../message/message.module';
import { PostCommentModule } from '../post-comment/post-comment.module';
import type { CreateUserDto } from '../user/dto';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { EmailService, EmailServiceMock } from '../utils';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { AuthService } from './auth.service';
import type { ForgetPasswordDto } from './dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let module: TestingModule;
  let id: Types.ObjectId;
  let githubUserId: Types.ObjectId;
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
        BlockModule,
        MessageModule,
        PostCommentModule,
        ImagesHandlerModule,
      ],
      providers: [AuthService, UserService, EmailService, ApiFeaturesService],
    })
      .overrideProvider(EmailService)
      .useValue(EmailServiceMock)
      .compile();
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    const user2: CreateUserDto = {
      email: 'example2@example.com',
      password: '12345678',
      username: 'test2',
    };
    const user = await userService.createUser(user2);
    id = user._id;
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(authService).toBeDefined();
  });

  const user1: CreateUserDto = {
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
        expect.objectContaining({
          email: user1.email,
          username: user1.username,
        }),
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
        { username: user1.username, password: user1.password },
        res,
      );
      expect(res.cookies.authorization).toBeDefined();
      expect(res.cookies.authorization.value).toEqual(
        expect.stringMatching(/^Bearer /),
      );
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({
          email: user1.email,
          username: user1.username,
        }),
      );
    });
    it("shouldn't login successfully", async () => {
      const res = createResponse();
      await expect(async () => {
        await authService.login(
          {
            username: user1.username,
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
  describe('changePassword', () => {
    it('should change successfully', async () => {
      const res = createResponse();
      await authService.changePassword(
        id,
        {
          oldPassword: '12345678',
          newPassword: '123456789',
        },
        res,
      );
      expect(res._getStatusCode()).toEqual(HttpStatus.OK);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ status: true }),
      );
    });
    it('should fail changing', async () => {
      const res = createResponse();
      await authService.changePassword(
        id,
        {
          oldPassword: '12345678',
          newPassword: '123456789',
        },
        res,
      );
      expect(res._getStatusCode()).toEqual(HttpStatus.FORBIDDEN);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ status: false }),
      );
    });
  });
  describe('change password using token', () => {
    it('should change password successfully', async () => {
      const res: any = await authService.changePasswordUsingToken(
        id,
        'new password',
      );
      expect(res).toEqual({ status: 'success' });
    });
    it('should throw an error due to wrong id', async () => {
      const wrongId: Types.ObjectId = new Types.ObjectId(10);
      await expect(
        authService.changePasswordUsingToken(wrongId, 'new password'),
      ).rejects.toThrow(`there is no user with id ${wrongId}`);
    });
  });
  describe('forget password', () => {
    it('should create and send token successfully', async () => {
      const dto: ForgetPasswordDto = { username: user1.username };
      const res: any = await authService.forgetPassword(dto);
      expect(res).toEqual({ status: 'success' });
    });
    it('should throw an error because wrong username', async () => {
      const dto: ForgetPasswordDto = { username: 'wrong_username' };
      await expect(async () => {
        await authService.forgetPassword(dto);
      }).rejects.toThrow(
        `there is no user with information {"username":"wrong_username"}`,
      );
    });
  });

  describe('continue', () => {
    it('should create gitub account successfully', async () => {
      const res = createResponse();
      const githunToken = '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';
      await authService.continueAuth(
        githunToken,
        res,
        'continueWithGithubAccount',
        authService.verfiyUserGithubData,
      );
      const userDataReturned = await JSON.parse(res._getData());
      githubUserId = userDataReturned._id;
      const userData = await userService.getUserById(userDataReturned._id);

      expect(userData.username).toEqual(userData.username);
      expect(userData.email).toEqual(userData.email);
    });
    it('unautherized', async () => {
      const res = createResponse();
      const githunToken = 'not_validTOkenJqFyeAHVq9hwJx3QCDEG2bR1Zw';
      await expect(async () => {
        await authService.continueAuth(
          githunToken,
          res,
          'continueWithGithubAccount',
          authService.verfiyUserGithubData,
        );
      }).rejects.toThrowError();
    });
    it('create google account successfully', async () => {
      const googleToken = 'not_validTOkenJqFyeAHVq9hwJx3QCDEG2bR1Zw';
      const res = createResponse();

      await authService.continueAuth(
        googleToken,
        res,
        'continueWithGithubAccount',
        // eslint-disable-next-line @typescript-eslint/require-await
        async (token) => ({
          email: 'test@gmail.com',
          token,
        }),
      );

      const userDataReturned = await JSON.parse(res._getData());
      const userData = await userService.getUserById(userDataReturned._id);

      expect(userData.username).toEqual(userData.username);
      expect(userData.email).toEqual(userData.email);
    });
    it('unautherized', async () => {
      const res = createResponse();
      const googleToken = 'not_validTOkenJqFyeAHVq9hwJx3QCDEG2bR1Zw38942143043';
      await expect(async () => {
        await authService.continueAuth(
          googleToken,
          res,
          'continueWithGithubAccount',
          authService.verfiyUserGmailData,
        );
      }).rejects.toThrowError();
    });
  });

  describe('get change email type', () => {
    it('should return normal', async () => {
      const res = await authService.changeMailRequestType(id);
      expect(res).toEqual({ operationType: 'changeEmail' });
    });
    it('should return normal', async () => {
      const res = await authService.changeMailRequestType(githubUserId);
      expect(res).toEqual({ operationType: 'createPassword' });
    });
  });

  describe('change email', () => {
    let newUser;
    it('should create and send token successfully', async () => {
      newUser = await userService.createUser({
        email: 'firstemail@gmail.com',
        password: '12345678',
        username: 'userTestEmail',
      });

      const res = await authService.changeEmail(newUser._id, {
        email: 'mynewemail@gmail.com',
        password: '12345678',
      });
      expect(res).toEqual({ status: 'success' });
    });

    it('should throw error (same email)', async () => {
      await expect(
        authService.changeEmail(newUser._id, {
          email: 'mynewemail@gmail.com',
          password: '12345678',
        }),
      ).rejects.toThrowError();
    });

    it('should throw error', async () => {
      await expect(
        authService.changeEmail(newUser._id, {
          email: 'mynewemail2@gmail.com',
          password: '12335611',
        }),
      ).rejects.toThrowError();
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

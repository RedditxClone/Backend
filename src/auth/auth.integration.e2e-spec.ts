import type { INestApplication } from '@nestjs/common';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { BlockModule } from '../block/block.module';
import { FollowModule } from '../follow/follow.module';
import type { CreateUserDto } from '../user/dto';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { EmailService, EmailServiceMock } from '../utils';
import { AllExceptionsFilter } from '../utils/all-exception.filter';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ForgetPasswordStrategy } from './stratigies/forget-password.strategy';
import { UserStrategy } from './stratigies/user.strategy';

describe('authController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  const dto: CreateUserDto = {
    email: 'email@example.com',
    password: '12345678',
    username: 'username',
  };
  const dto1: CreateUserDto = {
    email: 'email1@example.com',
    password: '12345678',
    username: 'username1',
  };
  let authService: AuthService;
  let token1: string;
  // let token2: string;
  // let id1: Types.ObjectId;
  // let id2: Types.ObjectId;

  const createDummyUsers = async () => {
    const authRes1 = await request(server).post('/auth/signup').send(dto1);
    // id1 = authRes1.body._id;
    const cookie1 = authRes1.headers['set-cookie'];
    const authRes2 = await request(server)
      .post('/auth/signup')
      .send({ ...dto, email: `a${dto.email}`, username: `a${dto.username}` });
    // id2 = authRes2.body._id;
    authRes2.get('Set-Cookie');
    token1 = cookie1[0].split('; ')[0].split('=')[1].replace('%20', ' ');
    // token2 = cookie2[0].split('; ')[0].split('=')[1].replace('%20', ' ');
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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
      ],
      controllers: [AuthController],
      providers: [
        UserService,
        AuthService,
        UserStrategy,
        EmailService,
        ForgetPasswordStrategy,
      ],
    })
      .overrideProvider(EmailService)
      .useValue(EmailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    authService = app.get<AuthService>(AuthService);
    await app.init();
    server = app.getHttpServer();
    await createDummyUsers();
  });
  describe('/POST /auth/signup', () => {
    it('must sign up successfully', async () => {
      const res = await request(server)
        .post('/auth/signup')
        .send(dto)
        .expect(HttpStatus.CREATED);
      expect(res.body).toEqual(
        expect.objectContaining({
          username: dto.username,
          email: dto.email,
        }),
      );
    });
    it('must fail', async () => {
      await request(server).post('/auth/signup').expect(HttpStatus.BAD_REQUEST);
    });
  });
  describe('/POST /auth/login', () => {
    it('must login successfully', async () => {
      await request(server)
        .post('/auth/login')
        .send({ username: dto.username, password: dto.password })
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              username: dto.username,
              email: dto.email,
            }),
          );
        });
    });
    it("mustn't login successfully", async () => {
      await request(server)
        .post('/auth/login')
        .send({ username: dto.username, password: 'wrong_password' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/POST /auth/forget-username', () => {
    it('must send successfully', async () => {
      await request(server)
        .post('/auth/forget-username')
        .send(dto)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({ status: 'success' }),
          );
        });
    });
    it("mustn't send successfully", async () => {
      await request(server)
        .post('/auth/forget-username')
        .send({ email: 'throw@throw.throw' })
        .expect(HttpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({ status: "couldn't send message" }),
          );
        });
    });
  });
  describe('/PATCH /auth/change-password', () => {
    it('must send successfully', async () => {
      await request(server)
        .patch('/auth/change-password')
        .send({ oldPassword: '12345678', newPassword: '123456789' })
        .set('authorization', token1)
        .expect(HttpStatus.OK)
        .then((res) => {
          expect(res.body).toEqual(expect.objectContaining({ status: true }));
        });
    });
    it("mustn't send successfully", async () => {
      await request(server)
        .patch('/auth/change-password')
        .send({ oldPassword: '12345678', newPassword: '123456789' })
        .set('authorization', token1)
        .expect(HttpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body).toEqual(expect.objectContaining({ status: false }));
        });
    });
  });

  describe('/POST /auth/forget-password', () => {
    it('must send with a token successfully', async () => {
      const res: any = await request(server)
        .post('/auth/forget-password')
        .send({ username: dto.username })
        .expect(HttpStatus.CREATED);
      expect(res.body).toEqual({ status: 'success' });
    });
    it('must throw an error because user not exist', async () => {
      const res = await request(server)
        .post('/auth/forget-password')
        .send({ username: 'wrong username' })
        .expect(HttpStatus.NOT_FOUND);
      expect(res.body.message).toEqual(
        'there is no user with information {"username":"wrong username"}',
      );
    });
  });

  describe('/POST /auth/change-forgotten-password', () => {
    let token: string;
    beforeAll(async () => {
      token = await authService.createChangePasswordToken(dto.username);
    });
    it('must change password successfully', async () => {
      // first get token for testing purpose
      // first change password
      const newPassword = 'new_password';
      const res = await request(server)
        .post('/auth/change-forgotten-password')
        .send({ password: newPassword })
        .set('authorization', `Bearer ${token}`)
        .expect(HttpStatus.CREATED);
      expect(res.body).toEqual({ status: 'success' });
      //login to make sure that it has been changed successfully
      await request(server)
        .post('/auth/login')
        .send({ username: dto.username, password: newPassword })
        .expect(HttpStatus.CREATED);
    });
    it('must throw an error due to unauthorized', async () => {
      const res = await request(server)
        .post('/auth/change-forgotten-password')
        .send({
          password: '123425h534',
        })
        .expect(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toEqual('Unauthorized');
    });
    it('must throw an error due to small password', async () => {
      const res = await request(server)
        .post('/auth/change-forgotten-password')
        .send({ password: '12kfl' })
        .set('authorization', `Bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toEqual([
        'Password Must have at least 8 characters',
      ]);
    });
  });
  afterAll(async () => {
    server.close();
    await closeInMongodConnection();
    await app.close();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongooseInMemory';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserSchema } from '../user/user.schema';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto';
import { FollowModule } from '../follow/follow.module';
import { EmailService, EmailServiceMock } from '../utils';
import { Types } from 'mongoose';
import { UserStrategy } from './stratigies/user.strategy';

describe('authController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  const dto: CreateUserDto = {
    age: 12,
    email: 'email@example.com',
    password: '12345678',
    username: 'username',
  };
  const dto1: CreateUserDto = {
    age: 12,
    email: 'email1@example.com',
    password: '12345678',
    username: 'username1',
  };
  let token1: string;
  let token2: string;
  let id1: Types.ObjectId;
  let id2: Types.ObjectId;
  const createDummyUsers = async () => {
    const authRes1 = await request(server).post('/auth/signup').send(dto1);
    id1 = authRes1.body.user._id;
    const cookie1 = authRes1.headers['set-cookie'];
    const authRes2 = await request(server)
      .post('/auth/signup')
      .send({ ...dto, email: `a${dto.email}`, username: `a${dto.username}` });
    id2 = authRes2.body.user._id;
    const cookie2 = authRes2.get('Set-Cookie');
    token1 = cookie1[0].split('; ')[0].split('=')[1].replace('%20', ' ');
    token2 = cookie2[0].split('; ')[0].split('=')[1].replace('%20', ' ');
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
      ],
      controllers: [AuthController],
      providers: [UserService, AuthService, UserStrategy, EmailService],
    })
      .overrideProvider(EmailService)
      .useValue(EmailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
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
      expect(res.body).toEqual(expect.objectContaining({ status: 'success' }));
      expect(res.body.user).toEqual(
        expect.objectContaining({
          username: dto.username,
          email: dto.email,
          age: dto.age,
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
        .send(dto)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({ status: 'success' }),
          );
          expect(res.body.user).toEqual(
            expect.objectContaining({
              username: dto.username,
              age: dto.age,
              email: dto.email,
            }),
          );
        });
    });
    it("mustn't login successfully", async () => {
      await request(server)
        .post('/auth/login')
        .send({ email: dto.email, password: 'wrong_password' })
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
        .send({ email: 'throw' })
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
  afterAll(async () => {
    server.close();
    await closeInMongodConnection();
    await app.close();
  });
});

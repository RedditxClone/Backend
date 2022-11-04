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
import { UserSchema } from './user.schema';
import { AuthController } from '../auth/auth.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto';
import { FollowSchema } from '../follow/follow.schema';
import { FollowModule } from '../follow/follow.module';
import { JWTUserGuard } from '../auth/guards/user.guard';
import { Types } from 'mongoose';
import { UserController } from './user.controller';
import { UserStrategy } from '../auth/stratigies/user.strategy';
import { EmailService } from '../utils';

jest.mock('../utils/mail/mail.service.ts');
describe('userController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  const dto: CreateUserDto = {
    email: 'email@example.com',
    password: '12345678',
    username: 'username',
  };
  let token1: string;
  let token2: string;
  let id1: Types.ObjectId;
  let id2: Types.ObjectId;
  const createDummyUsers = async () => {
    const authRes1 = await request(server).post('/auth/signup').send(dto);
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
        FollowModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'User', schema: UserSchema },
          { name: 'Follow', schema: FollowSchema },
        ]),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '15d' },
        }),
      ],
      controllers: [AuthController, UserController],
      providers: [UserService, AuthService, UserStrategy, EmailService],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
    await createDummyUsers();
  });
  describe('/POST /user/:user_id/follow', () => {
    it('must follow user successfully', async () => {
      const res = await request(server)
        .post(`/user/${id2.toString()}/follow`)
        .set('authorization', token1)
        .expect(HttpStatus.CREATED);
      expect(res.body).toEqual({ status: 'success' });
    });
    it('must throw unauthorized error', async () => {
      const res = await request(server)
        .post(`/user/${id2.toString()}/follow`)
        .expect(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toEqual('Unauthorized');
    });
    it('must throw duplicate error', async () => {
      const res = await request(server)
        .post(`/user/${id2.toString()}/follow`)
        .set('authorization', token1)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toEqual(
        `user with id : ${id1.toString()} is already following user with id : ${id2.toString()}`,
      );
    });
    it('must throw error because following yourself', async () => {
      const res = await request(server)
        .post(`/user/${id1.toString()}/follow`)
        .set('authorization', token1)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toEqual(
        `you are not allowed to follow yourself`,
      );
    });
  });
  describe('unfollow', () => {
    it('should unfollow successfully', async () => {
      const res = await request(server)
        .post(`/user/${id2.toString()}/unfollow`)
        .set('authorization', token1)
        .expect(HttpStatus.CREATED);
      expect(res.body).toEqual({ status: 'success' });
    });
    it('should throw an error', async () => {
      const res = await request(server)
        .post(`/user/${id2.toString()}/unfollow`)
        .set('authorization', token1)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toEqual(
        `user with id : ${id1.toString()} is not following user with id : ${id2.toString()}`,
      );
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
    server.close();
  });
});

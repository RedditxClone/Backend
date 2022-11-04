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
import { Types } from 'mongoose';
import { UserController } from './user.controller';
import { UserStrategy } from '../auth/stratigies/user.strategy';
import { EmailService } from '../utils';
import { BlockSchema } from '../block/block.schema';
import { BlockModule } from '../block/block.module';
import { AdminStrategy } from '../auth/stratigies/admin.startegy';

jest.mock('../utils/mail/mail.service.ts');
describe('userController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let userService: UserService;
  const dto: CreateUserDto = {
    age: 12,
    email: 'email@example.com',
    password: '12345678',
    username: 'username',
  };
  let token1: string;
  let token2: string;
  let id1: Types.ObjectId;
  let id2: Types.ObjectId;
  let adminId: Types.ObjectId;
  let adminToken: string;

  const getToken = (cookie: string): string =>
    cookie[0].split('; ')[0].split('=')[1].replace('%20', ' ');

  const createDummyUsers = async () => {
    const authRes1 = await request(server).post('/auth/signup').send(dto);
    id1 = authRes1.body._id;
    const cookie1 = authRes1.headers['set-cookie'];
    const authRes2 = await request(server)
      .post('/auth/signup')
      .send({ ...dto, email: `a${dto.email}`, username: `a${dto.username}` });
    id2 = authRes2.body._id;
    const cookie2 = authRes2.headers['set-cookie'];
    token1 = cookie1[0].split('; ')[0].split('=')[1].replace('%20', ' ');
    token2 = cookie2[0].split('; ')[0].split('=')[1].replace('%20', ' ');
  };
  const createAdminWithToken = async () => {
    const authRes = await request(server)
      .post('/auth/signup')
      .send({
        ...dto,
        email: `admin${dto.email}`,
        username: `admin${dto.username}`,
      });
    adminId = authRes.body._id;
    adminToken = getToken(authRes.header['set-cookie']);
    await userService.makeAdmin(adminId);
  };
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        FollowModule,
        BlockModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'User', schema: UserSchema },
          { name: 'Follow', schema: FollowSchema },
          { name: 'Block', schema: BlockSchema },
        ]),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '15d' },
        }),
      ],
      controllers: [AuthController, UserController],
      providers: [
        UserService,
        AuthService,
        UserStrategy,
        EmailService,
        AdminStrategy,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    userService = app.get<UserService>(UserService);
    server = app.getHttpServer();
    await createDummyUsers();
    await createAdminWithToken();
  });
  describe('GET /user/:user_id', () => {
    it('must get the user successfully', async () => {
      const res = await request(server)
        .get(`/user/${id1.toString()}`)
        .expect(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          _id: id1,
          username: dto.username,
          email: dto.email,
          age: dto.age,
        }),
      );
    });
    it('must throw an error because a non valid mongo id', async () => {
      const res = await request(server)
        .get(`/user/wrong_id`)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toEqual('wrong_id is not a valid MongoId');
    });
    it('must throw an error because there is no user with id', async () => {
      const wrong_id = new Types.ObjectId('wrong_id____');
      const res = await request(server)
        .get(`/user/${wrong_id}`)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toEqual(`there is no user with id ${wrong_id}`);
    });
  });
  describe('/POST /user/:user_id/follow', () => {
    it('must follow user successfully', async () => {
      const res = await request(server)
        .post(`/user/${id2.toString()}/follow`)
        .set('authorization', token1)
        .expect(HttpStatus.CREATED);
      expect(res.body).toEqual({ status: 'success' });
    });
    describe('must remove follow after blocking', () => {
      it('must block a user', async () => {
        const res = await request(server)
          .post(`/user/${id1.toString()}/block`)
          .set('authorization', token2)
          .expect(HttpStatus.CREATED);
        expect(res.body).toEqual({ status: 'success' });
      });

      it("mustn't allow to follow the user", async () => {
        const res2 = await request(server)
          .post(`/user/${id2.toString()}/follow`)
          .set('authorization', token1)
          .expect(HttpStatus.UNAUTHORIZED);
        expect(res2.body.message).toEqual(
          `there exist a block between you and this user`,
        );
      });
      it('must unblock the user', async () => {
        const res3 = await request(server)
          .post(`/user/${id1.toString()}/unblock`)
          .set('authorization', token2)
          .expect(HttpStatus.CREATED);
        expect(res3.body).toEqual({ status: 'success' });
      });
      it('must follow the user', async () => {
        const res4 = await request(server)
          .post(`/user/${id2.toString()}/follow`)
          .set('authorization', token1)
          .expect(HttpStatus.CREATED);
        expect(res4.body).toEqual({ status: 'success' });
      });
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
  describe('/POST /user/:user_id/unfollow', () => {
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
  describe('/POST /user/:user_id/block', () => {
    it('must block user successfully', async () => {
      const res = await request(server)
        .post(`/user/${id2.toString()}/block`)
        .set('authorization', token1)
        .expect(HttpStatus.CREATED);
      expect(res.body).toEqual({ status: 'success' });
    });
    it('must disallow following', async () => {
      const res = await request(server)
        .post(`/user/${id2.toString()}/follow`)
        .set('authorization', token1)
        .expect(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toEqual(
        `there exist a block between you and this user`,
      );
    });
    it('must throw unauthorized error', async () => {
      const res = await request(server)
        .post(`/user/${id2.toString()}/block`)
        .expect(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toEqual('Unauthorized');
    });
    it('must throw duplicate error', async () => {
      const res = await request(server)
        .post(`/user/${id2.toString()}/block`)
        .set('authorization', token1)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toEqual(
        `user with id : ${id1.toString()} is already blocking user with id : ${id2.toString()}`,
      );
    });
    it('must throw error because blocking yourself', async () => {
      const res = await request(server)
        .post(`/user/${id1.toString()}/block`)
        .set('authorization', token1)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toEqual(`you are not allowed to block yourself`);
    });
  });
  describe('/POST /user/:user_id/unblock', () => {
    it('should unblock successfully', async () => {
      const res = await request(server)
        .post(`/user/${id2.toString()}/unblock`)
        .set('authorization', token1)
        .expect(HttpStatus.CREATED);
      expect(res.body).toEqual({ status: 'success' });
    });
    it('should throw an error', async () => {
      const res = await request(server)
        .post(`/user/${id2.toString()}/unblock`)
        .set('authorization', token1)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toEqual(
        `user with id : ${id1.toString()} is not blocking user with id : ${id2.toString()}`,
      );
    });
  });
  describe('/POST /user/:user_id/make-moderator', () => {
    it('should create moderator successfully', async () => {
      const res = await request(server)
        .post(`/user/${id1.toString()}/make-moderator`)
        .set('authorization', adminToken)
        .expect(HttpStatus.CREATED);
      expect(res.body.authType).toEqual('moderator');
    });
    it('should refuse to make the admin moderator', async () => {
      const res = await request(server)
        .post(`/user/${adminId.toString()}/make-moderator`)
        .set('authorization', adminToken)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toEqual(
        'you are not allowed to change the role of the admin through this endpoint',
      );
    });
    it('should throw unauthorized', async () => {
      // regular user not admin
      const res = await request(server)
        .post(`/user/${id1.toString()}/make-moderator`)
        .set('authorization', token1)
        .expect(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toEqual(
        'you must be an admin to make this action',
      );
      // no user
      const res2 = await request(server)
        .post(`/user/${id1.toString()}/make-moderator`)
        .expect(HttpStatus.UNAUTHORIZED);
      expect(res2.body.message).toEqual('Unauthorized');
    });
  });
  describe('/POST /user/:user_id/make-admin', () => {
    it('should create admin successfully', async () => {
      const res = await request(server)
        .post(`/user/${id1.toString()}/make-admin`)
        .set('authorization', adminToken)
        .expect(HttpStatus.CREATED);
      expect(res.body.authType).toEqual('admin');
    });
    it("mustn't change the admin role", async () => {
      const res = await request(server)
        .post(`/user/${adminId.toString()}/make-admin`)
        .set('authorization', adminToken)
        .expect(HttpStatus.CREATED);
      expect(res.body.authType).toEqual('admin');
    });
    it('should throw unauthorized', async () => {
      // regular user not admin
      const res = await request(server)
        .post(`/user/${id1.toString()}/make-admin`)
        .set('authorization', token2)
        .expect(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toEqual(
        'you must be an admin to make this action',
      );
      // no user
      const res2 = await request(server)
        .post(`/user/${id1.toString()}/make-admin`)
        .expect(HttpStatus.UNAUTHORIZED);
      expect(res2.body.message).toEqual('Unauthorized');
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
    server.close();
  });
});

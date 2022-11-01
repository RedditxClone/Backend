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
import { EmailService, EmailServiceMock } from '../utils';

describe('authController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  const dto: CreateUserDto = {
    age: 12,
    email: 'email@example.com',
    password: '12345678',
    username: 'username',
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
      ],
      controllers: [AuthController],
      providers: [UserService, AuthService, EmailService],
    })
      .overrideProvider(EmailService)
      .useValue(EmailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });
  describe('/POST /auth/signup', () => {
    it('must sign up successfully', async () => {
      await request(server)
        .post('/auth/signup')
        .send(dto)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({ status: 'success' }),
          );
          expect(res.body.user).toEqual(
            expect.objectContaining({
              username: dto.username,
              email: dto.email,
              age: dto.age,
            }),
          );
        });
    });
    it('must fail', async () => {
      await request(server).post('/auth/signup').expect(HttpStatus.BAD_REQUEST);

      // await request(server).post('/auth/signup').expect()
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
  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
  });
});

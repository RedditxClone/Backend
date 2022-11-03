import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongooseInMemory';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { AvailableUsernameDto, CreateUserDto } from './dto';
import { UserController } from './user.controller';
import { Model } from 'mongoose';

describe('userController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let userService: UserService;
  const user1: CreateUserDto = {
    age: 10,
    email: 'email@example.com',
    password: '123456677',
    username: 'username1',
  };
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      ],
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
    userService = moduleFixture.get<UserService>(UserService);
  });

  describe('/POST /user/check-available-username', () => {
    it('must send successfully', async () => {
      const dto: AvailableUsernameDto = { username: 'notTaken' };
      await request(server)
        .post('/user/check-available-username')
        .send(dto)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body).toEqual(expect.objectContaining({ status: true }));
        });
    });
    it("mustn't send successfully", async () => {
      await userService.createUser(user1);
      const dto: AvailableUsernameDto = { username: 'username1' };
      await request(server)
        .post('/user/check-available-username')
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body).toEqual(expect.objectContaining({ status: false }));
        });
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
    server.close();
  });
});

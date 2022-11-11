import type { INestApplication } from '@nestjs/common';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { readFile, unlink } from 'fs/promises';
import { Types } from 'mongoose';
import request from 'supertest';

import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { UserStrategy } from '../auth/strategies/user.strategy';
import { BlockModule } from '../block/block.module';
import { CommentSchema } from '../comment/comment.schema';
import { FollowModule } from '../follow/follow.module';
import { PostCommentSchema } from '../post-comment/post-comment.schema';
import type { CreateUserDto } from '../user/dto';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { EmailService } from '../utils';
import { AllExceptionsFilter } from '../utils/all-exception.filter';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import type { CreatePostDto } from './dto';
import { PostController } from './post.controller';
import { PostSchema } from './post.schema';
import { PostService } from './post.service';
import { stubPost } from './test/stubs/post.stub';

jest.mock('../utils/mail/mail.service.ts');
describe('postController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  const userDto: CreateUserDto = {
    email: 'email@example.com',
    password: '12345678',
    username: 'username',
  };
  const postDto: CreatePostDto = {
    subredditId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
    title: 'post1',
    text: 'Hello World',
    nsfw: false,
    spoiler: false,
    flairs: [new Types.ObjectId('6363fba4ab2c2f94f3ac9f37')],
  };
  let token: string;
  let userId: Types.ObjectId;

  const createDummyUsers = async () => {
    const authRes1 = await request(server).post('/auth/signup').send(userDto);
    userId = authRes1.body._id;
    const cookie1 = authRes1.headers['set-cookie'];
    token = cookie1[0].split('; ')[0].split('=')[1].replace('%20', ' ');
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'User', schema: UserSchema },
          {
            name: 'PostComment',
            schema: PostCommentSchema,
            discriminators: [
              {
                name: 'Post',
                schema: PostSchema,
              },
              {
                name: 'Comment',
                schema: CommentSchema,
              },
            ],
          },
        ]),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '15d' },
        }),
        FollowModule,
        BlockModule,
      ],
      controllers: [PostController, AuthController],
      providers: [
        PostService,
        UserService,
        AuthService,
        EmailService,
        UserStrategy,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    server = app.getHttpServer();
    await createDummyUsers();
  });
  describe('POST /post/submit', () => {
    it('must create the post successfully', async () => {
      const res = await request(server)
        .post(`/post/submit`)
        .send(postDto)
        .set('authorization', token)
        .expect(HttpStatus.CREATED);
      expect(res.body).toMatchObject({ ...stubPost(), userId });
    });
  });
  describe('POST /post/upload-media', () => {
    it('must upload successfully', async () => {
      const res = await request(server)
        .post(`/post/upload-media`)
        .set('authorization', token)
        .attach('icon', __dirname + '/test/photos/testingPhoto.jpeg');
      const saveDir = `./statics/posts-media/${res.body.mediaIds[0]}`;
      expect(typeof (await readFile(saveDir))).toBe('object');
      expect(res.body.status).toEqual('success');
      await unlink(saveDir);
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
    server.close();
  });
});

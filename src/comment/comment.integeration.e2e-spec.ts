import type { INestApplication } from '@nestjs/common';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import request from 'supertest';

import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { UserStrategy } from '../auth/strategies/user.strategy';
import { BlockModule } from '../block/block.module';
import { CommentSchema } from '../comment/comment.schema';
import { FollowModule } from '../follow/follow.module';
import { PostSchema } from '../post/post.schema';
import { PostCommentService } from '../post-comment/__mocks__/post-comment.service';
import { PostCommentSchema } from '../post-comment/post-comment.schema';
import type { CreateUserDto } from '../user/dto';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { EmailService } from '../utils';
import { AllExceptionsFilter } from '../utils/all-exception.filter';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import type { CreateCommentDto } from './dto';
import { stubComment } from './test/stubs/comment.stubs';

jest.mock('../utils/mail/mail.service.ts');
describe('postController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  const userDto: CreateUserDto = {
    email: 'email@example.com',
    password: '12345678',
    username: 'username',
  };
  const commentDto: CreateCommentDto = {
    parentId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
    postId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
    text: 'Hello World',
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
        ImagesHandlerModule,
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
      controllers: [CommentController, AuthController],
      providers: [
        PostCommentService,
        CommentService,
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
  describe('POST /comment/submit', () => {
    it('must create the post successfully', async () => {
      const res = await request(server)
        .post(`/comment/submit`)
        .send(commentDto)
        .set('authorization', token)
        .expect(HttpStatus.CREATED);
      expect(res.body).toMatchObject({ ...stubComment(), userId });
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
    server.close();
  });
});

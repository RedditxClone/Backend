import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { readFile, unlink } from 'fs/promises';
import type { Types } from 'mongoose';
import request from 'supertest';
import type { CreateUserDto } from 'user/dto';

import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { ForgetPasswordStrategy } from '../auth/strategies/forget-password.strategy';
import { UserStrategy } from '../auth/strategies/user.strategy';
import { BlockModule } from '../block/block.module';
import { FollowModule } from '../follow/follow.module';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { AllExceptionsFilter } from '../utils/all-exception.filter';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import { EmailService } from '../utils/mail/mail.service';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import type { CreateSubredditDto } from './dto/create-subreddit.dto';
import type { FlairDto } from './dto/flair.dto';
import type { UpdateSubredditDto } from './dto/update-subreddit.dto';
import { SubredditController } from './subreddit.controller';
import { SubredditSchema } from './subreddit.schema';
import { SubredditService } from './subreddit.service';
import { SubredditUserSchema } from './subreddit-user.schema';

jest.mock('../utils/mail/mail.service.ts');

describe('subredditController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  const invalidId = '6363fba4ab2c2f94f3ac9f37';
  const invalidName = 'JPDptiOyGFdH';
  const createSubreddit: CreateSubredditDto = {
    name: 'subreddit',
    over18: false,
    type: 'public',
  };
  const dummySubreddit: CreateSubredditDto = {
    name: 'dummysubreddit',
    over18: false,
    type: 'public',
  };
  const defaultFields = {
    __v: 0,
    usersPermissions: 0,
    acceptPostingRequests: false,
    allowPostCrosspost: true,
    collapseDeletedComments: false,
    commentScoreHideMins: 0,
    archivePosts: false,
    allowMultipleImages: true,
    spoilersEnabled: true,
    suggestedCommentSort: 'None',
    acceptFollowers: true,
    allowImages: true,
    allowVideos: true,
    postTitleBannedWords: [],
    postBodyBannedWords: [],
    communityTopics: [],
    acceptingRequestsToJoin: true,
    requirePostFlair: false,
    postTextBodyRule: 0,
    restrictPostTitleLength: false,
    banPostBodyWords: false,
    banPostTitleWords: false,
    requireWordsInPostTitle: false,
    postGuidelines: '',
    welcomeMessageEnabled: false,
    flairList: [],
  };

  const userDto: CreateUserDto = {
    email: 'email@example.com',
    password: '12345678',
    username: 'username',
  };

  let token1: string;
  let id1: Types.ObjectId;

  const createDummyUsers = async () => {
    const authRes1 = await request(server).post('/auth/signup').send(userDto);
    id1 = authRes1.body._id;
    token1 = `Bearer ${authRes1.body.token}`;
  };

  const createDummySubreddit = async (token) => {
    const req = await request(server)
      .post('/subreddit')
      .set('authorization', token)
      .send(dummySubreddit);

    return req.body;
  };

  let sr;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        rootMongooseTestModule(),
        ImagesHandlerModule,
        MongooseModule.forFeature([
          { name: 'Subreddit', schema: SubredditSchema },
          { name: 'UserSubreddit', schema: SubredditUserSchema },
        ]),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '15d' },
        }),
        FollowModule,
        BlockModule,
        ImagesHandlerModule,
      ],

      controllers: [SubredditController, AuthController],
      providers: [
        SubredditService,
        UserService,
        AuthService,
        UserStrategy,
        EmailService,
        ForgetPasswordStrategy,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    server = app.getHttpServer();
    await createDummyUsers();
    sr = await createDummySubreddit(token1);
  });
  it('should be defined', () => {
    expect(app).toBeDefined();
  });
  describe('/POST /subreddit', () => {
    it('must create subreddit successfully', async () => {
      const res = await request(server)
        .post('/subreddit')
        .set('authorization', token1)
        .send(createSubreddit);
      expect(res.body).toEqual({
        ...defaultFields,
        ...createSubreddit,
        _id: res.body._id,
        moderators: [id1],
      });
    });
    it('must throw conflict error', async () => {
      const res = await request(server)
        .post('/subreddit')
        .set('authorization', token1)
        .send(createSubreddit);
      expect(res.body.message).toBe(
        `Subreddit with name ${createSubreddit.name} already exists.`,
      );
      expect(res.statusCode).toBe(HttpStatus.CONFLICT);
    });
    it('must throw error leckage of data', async () => {
      const res = await request(server)
        .post('/subreddit')
        .set('authorization', token1)
        .send({ over18: true, type: 'public' });
      expect(res.body.message).toEqual(
        'Subreddit validation failed: name: Path `name` is required.',
      );
    });
  });

  describe('/GET /subreddit/:subreddit', () => {
    it('must return a subreddit successfully', async () => {
      const res = await request(server).get(`/subreddit/${sr._id}`);
      expect(res.body).toEqual({
        ...sr,
      });
    });
    it('must throw error not found', async () => {
      const res = await request(server).get(`/subreddit/${invalidId}`);
      expect(res.body.message).toEqual('No subreddit with such id');
    });
  });

  describe('/GET /subreddit/r/:subreddit_name', () => {
    it('must return a subreddit successfully', async () => {
      const res = await request(server).get(`/subreddit/r/${sr.name}`);
      expect(res.body).toEqual({
        ...sr,
      });
    });
    it('must throw error not found', async () => {
      const res = await request(server).get(`/subreddit/r/${invalidName}`);
      expect(res.body.message).toEqual('No subreddit with such name');
    });
  });

  describe('/GET /subreddit/r/:subreddit_name/available', () => {
    it('must return that the subreddit name is available', async () => {
      const res = await request(server).get(
        `/subreddit/r/${invalidName}/available`,
      );
      expect(res.statusCode).toEqual(HttpStatus.OK);
    });
    it('must throw conflict error', async () => {
      const res = await request(server).get(
        `/subreddit/r/${sr.name}/available`,
      );
      expect(res.statusCode).toEqual(HttpStatus.CONFLICT);
    });
  });

  describe('/Patch /subreddit/:subreddit', () => {
    it('must return a subreddit successfully', async () => {
      const updatedFields: UpdateSubredditDto = {
        acceptFollowers: false,
        type: 'private',
      };
      const res = await request(server)
        .patch(`/subreddit/${sr._id}`)
        .send(updatedFields);
      expect(res.body).toEqual({
        status: 'success',
      });
    });
    it('must throw error no such subreddit exist', async () => {
      const updatedFields: UpdateSubredditDto = {
        acceptFollowers: false,
        type: 'public',
      };
      const res = await request(server)
        .patch(`/subreddit/${invalidId}`)
        .send(updatedFields);
      expect(res.body.message).toEqual('No subreddit with such id');
    });
  });
  let flairId: string;
  describe('/POST /subreddit/:subreddit/flair', () => {
    const flair: FlairDto = {
      backgroundColor: 'aaa321',
      textColor: 'fff',
      text: 'welcome',
    };
    it('must create a flair successfully', async () => {
      const res = await request(server)
        .post(`/subreddit/${sr._id}/flair`)
        .send(flair);
      flairId = res.body.flairList[0]._id.toString();
      expect(res.body).toEqual({
        _id: res.body._id,
        flairList: [
          {
            ...flair,
            _id: flairId,
          },
        ],
      });
    });
    it('must throw error subreddit is not exist', async () => {
      const res = await request(server)
        .post(`/subreddit/${invalidId}/flair`)
        .send(flair);
      expect(res.body.message).toEqual('No subreddit with such id');
    });
  });

  describe('/DELETE /subreddit/:subreddit/flair', () => {
    it('must delete a flair successfully', async () => {
      const res = await request(server).delete(
        `/subreddit/${sr._id}/flair/${flairId}`,
      );
      expect(res.body).toEqual({ status: 'success' });
    });
    it("must throw error subreddit doesn't exist", async () => {
      const res = await request(server).delete(
        `/subreddit/${invalidId}/flair/${flairId}`,
      );
      expect(res.body.message).toEqual('No subreddit with such id');
    });
  });

  describe('/POST /subreddit/:subreddit/icon', () => {
    it('must upload a photo successfully', async () => {
      const res = await request(server)
        .post(`/subreddit/${sr._id}/icon`)
        .attach('icon', __dirname + '/test/photos/testingPhoto.jpeg');
      expect(typeof (await readFile(res.body.icon))).toBe('object');
      expect(res.body).toEqual({
        icon: res.body.icon,
      });
      await unlink(res.body.icon);
    });
    it("must throw error subreddit doesn't exist", async () => {
      const res = await request(server)
        .post(`/subreddit/${invalidId}/icon`)
        .attach('icon', __dirname + '/test/photos/testingPhoto.jpeg');
      expect(res.body.message).toEqual('No subreddit with such id');
    });
    it('must throw error subreddit no icon provided', async () => {
      const res = await request(server).post(`/subreddit/${sr._id}1/icon`);
      expect(res.body.message).toEqual('File is required');
    });
  });

  describe('/DELETE /subreddit/:subreddit/icon', () => {
    it('The Icon removed successfully', async () => {
      await request(server)
        .post(`/subreddit/${sr._id}/icon`)
        .attach('icon', __dirname + '/test/photos/testingPhoto.jpeg');
      const res = await request(server).delete(`/subreddit/${sr._id}/icon`);
      expect(res.body).toEqual({
        status: 'success',
      });
    });
    it("must throw error subreddit doesn't exist", async () => {
      const res = await request(server).delete(`/subreddit/${invalidId}/icon`);
      expect(res.body.message).toEqual('No subreddit with such id');
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
    server.close();
  });
});

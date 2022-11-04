import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongooseInMemory';
import { MongooseModule } from '@nestjs/mongoose';
import { SubredditSchema } from './subreddit.schema';
import { SubredditController } from './subreddit.controller';
import { SubredditService } from './subreddit.service';

jest.mock('../utils/mail/mail.service.ts');
describe('subredditController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'subreddit', schema: SubredditSchema },
        ]),
      ],
      controllers: [SubredditController],
      providers: [SubredditService],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });
  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('/POST /subreddit/:subreddit', () => {
    it('must create subreddit successfully', async () => {
      // const res = await request(server).post(`/user/${id2.toString()}/follow`);
      // expect(res.body).toEqual({ status: 'success' });
    });
    // it('must throw unauthorized error', async () => {
    //   const res = await request(server)
    //     .post(`/user/${id2.toString()}/follow`)
    //     .expect(HttpStatus.UNAUTHORIZED);
    //   expect(res.body.message).toEqual('Unauthorized');
    // });
    // it('must throw duplicate error', async () => {
    //   const res = await request(server)
    //     .post(`/user/${id2.toString()}/follow`)
    //     .set('authorization', token1)
    //     .expect(HttpStatus.BAD_REQUEST);
    //   expect(res.body.message).toEqual(
    //     `user with id : ${id1.toString()} is already following user with id : ${id2.toString()}`,
    //   );
    // });
    // it('must throw error because following yourself', async () => {
    //   const res = await request(server)
    //     .post(`/user/${id1.toString()}/follow`)
    //     .set('authorization', token1)
    //     .expect(HttpStatus.BAD_REQUEST);
    //   expect(res.body.message).toEqual(
    //     `you are not allowed to follow yourself`,
    //   );
    // });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
    server.close();
  });
});

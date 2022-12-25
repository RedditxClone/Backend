import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { MessageService } from '../message/message.service';
import { NotificationModule } from '../notification/notification.module';
import { HideSchema } from '../post/hide.schema';
import { PostSchema } from '../post/post.schema';
import { PostService } from '../post/post.service';
import { PostCommentSchema } from '../post-comment/post-comment.schema';
import { PostCommentService } from '../post-comment/post-comment.service';
import { SubredditSchema } from '../subreddit/subreddit.schema';
import { SubredditUserSchema } from '../subreddit/subreddit-user.schema';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { VoteSchema } from '../vote/vote.schema';
import { CommentSchema } from './comment.schema';
import { CommentService } from './comment.service';

jest.mock('../message/message.service.ts');
describe('CommentService', () => {
  let service: CommentService;
  let module: TestingModule;
  // const commentDto: CreateCommentDto = {
  //   subredditId: new Types.ObjectId(1),
  //   postId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
  //   parentId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
  //   text: 'Hello World',
  // };
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        NotificationModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([
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
          {
            name: 'Hide',
            schema: HideSchema,
          },
          {
            name: 'Vote',
            schema: VoteSchema,
          },
          {
            name: 'UserSubreddit',
            schema: SubredditUserSchema,
          },
          {
            name: 'Subreddit',
            schema: SubredditSchema,
          },
        ]),
      ],

      providers: [
        CommentService,
        PostService,
        PostCommentService,
        MessageService,
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

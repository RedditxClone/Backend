import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { BlockSchema } from '../../block/block.schema';
import { BlockService } from '../../block/block.service';
import { CommentSchema } from '../../comment/comment.schema';
import { CommentService } from '../../comment/comment.service';
import { FollowSchema } from '../../follow/follow.schema';
import { FollowService } from '../../follow/follow.service';
import { MessageSchema } from '../../message/message.schema';
import { MessageService } from '../../message/message.service';
import { NotificationSchema } from '../../notification/notification.schema';
import { NotificationService } from '../../notification/notification.service';
import { HideSchema } from '../../post/hide.schema';
import { PostSchema } from '../../post/post.schema';
import { PostService } from '../../post/post.service';
import { PostCommentSchema } from '../../post-comment/post-comment.schema';
import { PostCommentService } from '../../post-comment/post-comment.service';
import { SubredditSchema } from '../../subreddit/subreddit.schema';
import { SubredditService } from '../../subreddit/subreddit.service';
import { SubredditUserSchema } from '../../subreddit/subreddit-user.schema';
import { SubredditUserLeftSchema } from '../../subreddit/subreddit-user-left.schema';
import { UserSchema } from '../../user/user.schema';
import { UserService } from '../../user/user.service';
import { VoteSchema } from '../../vote/vote.schema';
import { ApiFeaturesService } from '../apiFeatures/api-features.service';
import { ImagesHandlerModule } from '../imagesHandler/images-handler.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../mongoose-in-memory';
import { TestModelSchema } from '../testing/test-api-feature-model-testing';
import { SeederService } from './seeder.service';

describe('seederService', () => {
  let service: SeederService;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        rootMongooseTestModule(),
        ImagesHandlerModule,
        MongooseModule.forFeature([
          { name: 'TestModel', schema: TestModelSchema },
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
          { name: 'Follow', schema: FollowSchema },
          { name: 'Block', schema: BlockSchema },
          { name: 'Hide', schema: HideSchema },
          { name: 'Subreddit', schema: SubredditSchema },
          { name: 'UserSubreddit', schema: SubredditUserSchema },
          { name: 'UserSubredditLeft', schema: SubredditUserLeftSchema },
          { name: 'Notification', schema: NotificationSchema },
          { name: 'User', schema: UserSchema },
          {
            name: 'Vote',
            schema: VoteSchema,
          },
          {
            name: 'Hide',
            schema: HideSchema,
          },
          { name: 'Message', schema: MessageSchema },
        ]),
      ],
      controllers: [],
      providers: [
        SeederService,
        Logger,
        SubredditService,
        UserService,
        FollowService,
        BlockService,
        ApiFeaturesService,
        NotificationService,
        CommentService,
        PostService,
        PostCommentService,
        MessageService,
      ],
    }).compile();
    service = module.get<SeederService>(SeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should run successfully', async () => {
    await expect(service.seed()).resolves.not.toThrowError();
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

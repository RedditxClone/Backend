import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { BlockSchema } from '../../block/block.schema';
import { BlockService } from '../../block/block.service';
import { CommentSchema } from '../../comment/comment.schema';
import { FollowSchema } from '../../follow/follow.schema';
import { FollowService } from '../../follow/follow.service';
import { NotificationModule } from '../../notification/notification.module';
import { HideSchema } from '../../post/hide.schema';
import { PostSchema } from '../../post/post.schema';
import { PostService } from '../../post/post.service';
import { PostCommentModule } from '../../post-comment/post-comment.module';
import { PostCommentSchema } from '../../post-comment/post-comment.schema';
import { PostCommentService } from '../../post-comment/post-comment.service';
import { SubredditModule } from '../../subreddit/subreddit.module';
import { SubredditSchema } from '../../subreddit/subreddit.schema';
import { SubredditService } from '../../subreddit/subreddit.service';
import { SubredditUserSchema } from '../../subreddit/subreddit-user.schema';
import { SubredditUserLeftSchema } from '../../subreddit/subreddit-user-left.schema';
import { UserSchema } from '../../user/user.schema';
import { UserService } from '../../user/user.service';
import { VoteSchema } from '../../vote/vote.schema';
import { ApiFeaturesService } from '../apiFeatures/api-features.service';
import { ImagesHandlerModule } from '../imagesHandler/images-handler.module';
import { rootMongooseTestModule } from '../mongoose-in-memory';
import { SeederService } from './seeder.service';

/**
 * Import and provide seeder classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot(),
    // MongooseModule.forRoot(process.env.DB_CONNECTION_STRING || ''),
    rootMongooseTestModule(),
    // MongooseModule.forFeature([
    //   {
    //     name: 'PostComment',
    //     schema: PostCommentSchema,
    //     discriminators: [
    //       {
    //         name: 'Post',
    //         schema: PostSchema,
    //       },
    //       {
    //         name: 'Comment',
    //         schema: CommentSchema,
    //       },
    //     ],
    //   },
    //   {
    //     name: 'Vote',
    //     schema: VoteSchema,
    //   },
    //   {
    //     name: 'Hide',
    //     schema: HideSchema,
    //   },
    // ]),
    PostCommentModule,
    SubredditModule,
    rootMongooseTestModule(),
    ImagesHandlerModule,
    NotificationModule,
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
      { name: 'Follow', schema: FollowSchema },
      { name: 'Block', schema: BlockSchema },
      { name: 'Hide', schema: HideSchema },
      { name: 'Subreddit', schema: SubredditSchema },
      { name: 'UserSubreddit', schema: SubredditUserSchema },
      { name: 'UserSubredditLeft', schema: SubredditUserLeftSchema },

      { name: 'User', schema: UserSchema },
      {
        name: 'Vote',
        schema: VoteSchema,
      },
      {
        name: 'Hide',
        schema: HideSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [
    SeederService,
    Logger,
    PostCommentService,
    PostService,
    SubredditService,
    UserService,
    FollowService,
    BlockService,
    ApiFeaturesService,
  ],
  exports: [SeederService],
})
export class SeederModule {}

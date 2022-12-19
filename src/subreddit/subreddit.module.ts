import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationModule } from '../notification/notification.module';
import { HideSchema } from '../post/hide.schema';
import { PostCommentSchema } from '../post-comment/post-comment.schema';
import { PostCommentService } from '../post-comment/post-comment.service';
import { UserModule } from '../user/user.module';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import { VoteSchema } from '../vote/vote.schema';
import { SubredditController } from './subreddit.controller';
import { SubredditSchema } from './subreddit.schema';
import { SubredditService } from './subreddit.service';
import { SubredditUserSchema } from './subreddit-user.schema';
import { SubredditUserLeftSchema } from './subreddit-user-left.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Subreddit', schema: SubredditSchema },
      { name: 'UserSubreddit', schema: SubredditUserSchema },
      { name: 'UserSubredditLeft', schema: SubredditUserLeftSchema },
      {
        name: 'PostComment',
        schema: PostCommentSchema,
      },
      {
        name: 'Vote',
        schema: VoteSchema,
      },
      {
        name: 'Hide',
        schema: HideSchema,
      },
    ]),
    UserModule,
    ImagesHandlerModule,
    NotificationModule,
  ],
  controllers: [SubredditController],
  providers: [SubredditService, PostCommentService],
  exports: [SubredditService],
})
export class SubredditModule {}

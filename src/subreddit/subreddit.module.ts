import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { HideSchema } from '../post/hide.schema';
import { PostCommentSchema } from '../post-comment/post-comment.schema';
import { PostCommentService } from '../post-comment/post-comment.service';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import { VoteSchema } from '../vote/vote.schema';
import { SubredditController } from './subreddit.controller';
import { SubredditSchema } from './subreddit.schema';
import { SubredditService } from './subreddit.service';
import { SubredditUserSchema } from './subreddit-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Subreddit', schema: SubredditSchema },
      { name: 'UserSubreddit', schema: SubredditUserSchema },
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
    ImagesHandlerModule,
  ],
  controllers: [SubredditController],
  providers: [SubredditService, ApiFeaturesService, PostCommentService],
  exports: [SubredditService],
})
export class SubredditModule {}

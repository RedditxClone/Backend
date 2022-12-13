import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JWTUserIfExistGuard } from '../auth/guards/user-if-exist.guard';
import { CommentController } from '../comment/comment.controller';
import { CommentSchema } from '../comment/comment.schema';
import { CommentService } from '../comment/comment.service';
import { HideSchema } from '../post/hide.schema';
import { PostController } from '../post/post.controller';
import { PostSchema } from '../post/post.schema';
import { PostService } from '../post/post.service';
import { SubredditSchema } from '../subreddit/subreddit.schema';
import { SubredditService } from '../subreddit/subreddit.service';
import { SubredditUserSchema } from '../subreddit/subreddit-user.schema';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { ImagesHandlerService } from '../utils/imagesHandler/images-handler.service';
import { VoteSchema } from '../vote/vote.schema';
import { PostCommentController } from './post-comment.controller';
import { PostCommentSchema } from './post-comment.schema';
import { PostCommentService } from './post-comment.service';

@Module({
  imports: [
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
        name: 'Vote',
        schema: VoteSchema,
      },
      {
        name: 'Hide',
        schema: HideSchema,
      },
      {
        name: 'Subreddit',
        schema: SubredditSchema,
      },
      {
        name: 'UserSubreddit',
        schema: SubredditUserSchema,
      },
    ]),
  ],
  controllers: [PostCommentController, PostController, CommentController],
  providers: [
    PostCommentService,
    PostService,
    CommentService,
    ApiFeaturesService,
    JWTUserIfExistGuard,
    SubredditService,
    ImagesHandlerService,
  ],
  exports: [PostCommentService],
})
export class PostCommentModule {}

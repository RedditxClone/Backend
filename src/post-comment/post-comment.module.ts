import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CommentController } from '../comment/comment.controller';
import { CommentSchema } from '../comment/comment.schema';
import { CommentService } from '../comment/comment.service';
import { PostController } from '../post/post.controller';
import { PostSchema } from '../post/post.schema';
import { PostService } from '../post/post.service';
import { SubredditModule } from '../subreddit/subreddit.module';
// import { SubredditService } from '../subreddit/subreddit.service';
import { PostCommentController } from './post-comment.controller';
import { PostCommentSchema } from './post-comment.schema';
import { PostCommentService } from './post-comment.service';

@Module({
  imports: [
    SubredditModule,
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
    ]),
  ],
  controllers: [PostCommentController, PostController, CommentController],
  providers: [PostCommentService, PostService, CommentService],
})
export class PostCommentModule {}

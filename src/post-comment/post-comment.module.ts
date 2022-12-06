import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CommentController } from '../comment/comment.controller';
import { CommentSchema } from '../comment/comment.schema';
import { CommentService } from '../comment/comment.service';
import { PostController } from '../post/post.controller';
import { PostSchema } from '../post/post.schema';
import { PostService } from '../post/post.service';
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
    ]),
  ],
  controllers: [PostCommentController, PostController, CommentController],
  providers: [PostCommentService, PostService, CommentService],
  exports: [PostCommentService],
})
export class PostCommentModule {}

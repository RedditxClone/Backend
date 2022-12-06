import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlockModule } from '../block/block.module';
import { CommentSchema } from '../comment/comment.schema';
import { PostSchema } from '../post/post.schema';
import { PostCommentSchema } from '../post-comment/post-comment.schema';
// import { PostSchema } from '../post/post.schema';
import { SubredditSchema } from '../subreddit/subreddit.schema';
import { UserSchema } from '../user/user.schema';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Subreddit', schema: SubredditSchema }]),
    BlockModule,
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
  controllers: [SearchController],
  providers: [SearchService, ApiFeaturesService],
})
export class SearchModule {}

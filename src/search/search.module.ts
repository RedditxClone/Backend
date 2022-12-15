import { Module } from '@nestjs/common';

import { PostCommentModule } from '../post-comment/post-comment.module';
import { SubredditModule } from '../subreddit/subreddit.module';
import { UserModule } from '../user/user.module';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [UserModule, PostCommentModule, SubredditModule],
  controllers: [SearchController],
  providers: [SearchService, ApiFeaturesService],
})
export class SearchModule {}

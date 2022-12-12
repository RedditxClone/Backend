import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import { SubredditController } from './subreddit.controller';
import { SubredditSchema } from './subreddit.schema';
import { SubredditService } from './subreddit.service';
import { SubredditUserSchema } from './subreddit-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Subreddit', schema: SubredditSchema },
      { name: 'UserSubreddit', schema: SubredditUserSchema },
    ]),
    ImagesHandlerModule,
  ],
  controllers: [SubredditController],
  providers: [SubredditService, ApiFeaturesService],
  exports: [SubredditService],
})
export class SubredditModule {}

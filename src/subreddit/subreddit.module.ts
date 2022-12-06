import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import { SubredditController } from './subreddit.controller';
import { SubredditSchema } from './subreddit.schema';
import { SubredditService } from './subreddit.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Subreddit', schema: SubredditSchema }]),
    ImagesHandlerModule,
  ],
  controllers: [SubredditController],
  providers: [SubredditService],
  exports: [SubredditService],
})
export class SubredditModule {}

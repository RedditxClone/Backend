import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubredditController } from './subreddit.controller';
import { SubredditSchema } from './subreddit.schema';
import { SubredditService } from './subreddit.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'subreddit', schema: SubredditSchema }]),
  ],
  controllers: [SubredditController],
  providers: [SubredditService],
  exports: [SubredditService],
})
export class SubredditModule {}

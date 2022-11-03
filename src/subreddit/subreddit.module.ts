import { Module } from '@nestjs/common';
import { SubredditService } from './subreddit.service';
import { SubredditController } from './subreddit.controller';

@Module({
  controllers: [SubredditController],
  providers: [SubredditService],
})
export class SubredditModule {}

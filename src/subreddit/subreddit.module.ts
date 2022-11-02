import { Module } from '@nestjs/common';
import { SubredditService } from './subreddit.service';
import { SubredditController } from './subreddit.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SubredditSchema } from './subreddit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'subreddit', schema: SubredditSchema }]),
  ],
  controllers: [SubredditController],
  providers: [SubredditService],
})
export class SubredditModule {}

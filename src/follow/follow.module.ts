import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FollowSchema } from './follow.schema';
import { FollowService } from './follow.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Follow', schema: FollowSchema }]),
  ],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}

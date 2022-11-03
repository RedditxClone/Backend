import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowSchema } from './follow.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Follow', schema: FollowSchema }]),
  ],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}

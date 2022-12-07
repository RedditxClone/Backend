import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { FollowSchema } from './follow.schema';
import { FollowService } from './follow.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Follow', schema: FollowSchema }]),
  ],
  providers: [FollowService, ApiFeaturesService],
  exports: [FollowService],
})
export class FollowModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationModule } from '../notification/notification.module';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { FollowSchema } from './follow.schema';
import { FollowService } from './follow.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Follow', schema: FollowSchema }]),
    NotificationModule,
  ],
  providers: [FollowService, ApiFeaturesService],
  exports: [FollowService],
})
export class FollowModule {}

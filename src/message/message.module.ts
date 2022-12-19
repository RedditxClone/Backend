import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlockModule } from '../block/block.module';
import { UserModule } from '../user/user.module';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { MessageController } from './message.controller';
import { MessageSchema } from './message.schema';
import { MessageService } from './message.service';

@Module({
  imports: [
    forwardRef(() => BlockModule),
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
  ],
  controllers: [MessageController],
  providers: [MessageService, ApiFeaturesService],
  exports: [MessageService],
})
export class MessageModule {}

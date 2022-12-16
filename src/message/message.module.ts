import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlockModule } from '../block/block.module';
import { UserModule } from '../user/user.module';
import { MessageController } from './message.controller';
import { MessageSchema } from './message.schema';
import { MessageService } from './message.service';

@Module({
  imports: [
    BlockModule,
    UserModule,
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminStrategy } from '../auth/strategies/admin.strategy';
import { UserStrategy } from '../auth/strategies/user.strategy';
import { UserIfExistStrategy } from '../auth/strategies/user-if-exist.strategy';
import { BlockModule } from '../block/block.module';
import { FollowModule } from '../follow/follow.module';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import { UserController } from './user.controller';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';
@Module({
  imports: [
    FollowModule,
    BlockModule,
    ImagesHandlerModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  providers: [UserService, UserStrategy, AdminStrategy, UserIfExistStrategy],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}

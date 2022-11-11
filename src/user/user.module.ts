import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminStrategy } from '../auth/strategies/admin.strategy';
import { UserStrategy } from '../auth/strategies/user.strategy';
import { BlockModule } from '../block/block.module';
import { FollowModule } from '../follow/follow.module';
import { UserController } from './user.controller';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';
@Module({
  imports: [
    FollowModule,
    BlockModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  providers: [UserService, UserStrategy, AdminStrategy],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}

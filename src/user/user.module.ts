import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserStrategy } from '../auth/stratigies/user.strategy';
import { FollowModule } from '../follow/follow.module';
@Module({
  imports: [
    FollowModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  providers: [UserService, UserStrategy],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}

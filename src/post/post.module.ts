import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { ApiFeaturesService } from 'utils/apiFeatures/api-features.service';

import { UserIfExistStrategy } from '../auth/strategies/user-if-exist.strategy';
import { PostController } from './post.controller';
import { PostSchema } from './post.schema';
import { PostService } from './post.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]),
    PassportModule,
    MulterModule.register({
      dest: './statics/posts-media',
    }),
  ],
  controllers: [PostController],
  providers: [PostService, UserIfExistStrategy, ApiFeaturesService],
})
export class PostModule {}

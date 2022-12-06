import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CommentController } from './comment.controller';
import { CommentSchema } from './comment.schema';
import { CommentService } from './comment.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PostComment } from '../post-comment/post-comment.schema';

export type CommentDocument = Comment & Document;
@Schema()
export class Comment extends PostComment {
  @Prop({ required: true, ref: 'Post' })
  postId: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

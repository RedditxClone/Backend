import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
export type PostCommentDocument = PostComment & Document;
@Schema({ discriminatorKey: 'type' })
export class PostComment {
  type: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: 0 })
  upvotesCount: number;

  @Prop({ default: 0 })
  downvotesCount: number;

  @Prop({ default: Date.now })
  createdDate: Date;

  @Prop({ ref: 'PostComment', default: null })
  parentId: Types.ObjectId;

  @Prop({ ref: 'User' })
  userId: Types.ObjectId;
}

export const PostCommentSchema = SchemaFactory.createForClass(PostComment);

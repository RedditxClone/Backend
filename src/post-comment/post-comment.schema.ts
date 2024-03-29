import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
export type PostCommentDocument = PostComment & Document;
@Schema({ discriminatorKey: 'type' })
export class PostComment {
  type: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: '' })
  text: string;

  @Prop({ default: 0 })
  votesCount: number;

  @Prop({ default: Date.now })
  createdDate: Date;

  @Prop({ ref: 'PostComment', default: null })
  parentId: Types.ObjectId;

  @Prop({ ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ ref: 'Subreddit', required: true })
  subredditId: Types.ObjectId;

  @Prop({ default: null })
  spammedBy: string;

  @Prop({ default: null })
  spammedAt: Date;

  @Prop({ default: null })
  removedBy: string;

  @Prop({ default: null })
  removedAt: Date;

  @Prop({ default: null })
  editedAt: Date;

  @Prop({ default: null })
  editCheckedBy: string;

  @Prop({ default: false })
  replyNotifications: boolean;
}
export const PostCommentSchema = SchemaFactory.createForClass(PostComment);

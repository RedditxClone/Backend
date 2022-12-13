import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';
import { Types } from 'mongoose';

export type MessageDocument = Message & Document;
@Schema()
export class Message {
  @Prop({ default: null, ref: 'Message', type: Types.ObjectId })
  firstMessageId: Types.ObjectId | null;

  @Prop({ default: null, ref: 'Message' })
  parentId: Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  authorName: string;

  @Prop({ required: true, ref: 'User' })
  destName: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  body: string;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({
    enum: ['private_msg', 'comment_reply', 'post_reply'],
    default: 'private_msg',
  })
  type: string;

  @Prop({ default: null, ref: 'PostComment' })
  postCommentId: Types.ObjectId;
}

export const MessageSchema = (() => {
  const schema = SchemaFactory.createForClass(Message);
  schema.index({ authorName: 1 });
  schema.index({ destName: 1 });

  return schema;
})();

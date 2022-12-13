import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';
import { Types } from 'mongoose';
export type NotificationDocument = Notification & Document;
export type NotificationWithId = NotificationDocument & { _id };

@Schema()
export class Notification {
  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ ref: 'User' })
  notifierId: Types.ObjectId;

  @Prop({
    enum: [
      'comment_reply',
      'post_reply',
      'post_vote', // upvote on post
      'comment_vote', // upvote on comment
      'follow', // user follow
    ],
    required: true,
  })
  type: string;

  //can ba a message or post/comment
  @Prop({ required: true })
  refId: Types.ObjectId;

  @Prop({ required: true })
  body: string;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: true })
  new: boolean;

  @Prop({ default: false })
  hidden: boolean;
}

export const NotificationSchema = (() => {
  const schema = SchemaFactory.createForClass(Notification);
  schema.index({ userId: 1 });

  return schema;
})();

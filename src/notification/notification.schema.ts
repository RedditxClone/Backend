import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';
import { Types } from 'mongoose';
export type NotificationDocument = Notification & Document;

@Schema()
export class Notification {
  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, ref: 'PostComment' })
  postCommentId: Types.ObjectId;

  @Prop({ required: true })
  body: string;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: false })
  isNew: boolean;

  @Prop({ default: false })
  hidden: boolean;
}

export const NotificationSchema = (() => {
  const schema = SchemaFactory.createForClass(Notification);
  schema.index({ userId: 1 });

  return schema;
})();

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';
import { Types } from 'mongoose';

export type HideDocument = Hide & Document;
@Schema()
export class Hide {
  @Prop({ required: true, ref: 'Post' })
  postId: Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;
}

export const FollowSchema = (() => {
  const schema = SchemaFactory.createForClass(Hide);
  schema.index({ userId: 1, postId: 1 }, { unique: true });

  return schema;
})();

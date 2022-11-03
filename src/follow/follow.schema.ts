import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FollowDocument = Follow & Document;
@Schema()
export class Follow {
  @Prop({ required: true, ref: 'User' })
  follower: Types.ObjectId;
  @Prop({ required: true, ref: 'User' })
  followed: Types.ObjectId;
}

export const FollowSchema = (() => {
  const schema = SchemaFactory.createForClass(Follow);
  schema.index({ follower: 1, followed: 1 }, { unique: true });
  return schema;
})();

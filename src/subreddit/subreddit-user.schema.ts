import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';
import { Types } from 'mongoose';

export type SubredditUserDocument = SubredditUser & Document;
@Schema()
export class SubredditUser {
  @Prop({ required: true, ref: 'Subreddit' })
  subredditId: Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;
}

export const FollowSchema = (() => {
  const schema = SchemaFactory.createForClass(SubredditUser);
  schema.index({ subredditId: 1, userId: 1 }, { unique: true });

  return schema;
})();

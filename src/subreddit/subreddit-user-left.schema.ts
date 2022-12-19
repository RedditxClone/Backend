import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';
import { Types } from 'mongoose';

export type SubredditUserLeftDocument = SubredditUserLeft & Document;
@Schema()
export class SubredditUserLeft {
  @Prop({ required: true, ref: 'Subreddit' })
  subredditId: Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ default: new Date() })
  date: Date;
}

export const SubredditUserLeftSchema = (() => {
  const schema = SchemaFactory.createForClass(SubredditUserLeft);
  schema.index({ subredditId: 1, userId: 1 }, { unique: true });

  return schema;
})();

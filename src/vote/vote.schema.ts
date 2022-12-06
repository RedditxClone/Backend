import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type VoteDocument = Vote & Document;
export type VoteWithId = Vote & { _id: Types.ObjectId };

@Schema()
export class Vote {
  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, ref: 'PostComment' })
  thingId: Types.ObjectId;

  @Prop({ required: true })
  isUpvote: boolean;
}

export const VoteSchema = (() => {
  const schema = SchemaFactory.createForClass(Vote);
  schema.index({ userId: 1, thingId: 1 }, { unique: true });

  return schema;
})();

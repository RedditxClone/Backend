import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type VoteDocument = Vote & Document;

@Schema()
export class Vote {
  @Prop({ required: true, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ required: true, ref: 'PostComment' })
  thing: Types.ObjectId;
}

export const VoteSchema = (() => {
  const schema = SchemaFactory.createForClass(Vote);
  schema.index({ user: 1, thing: 1 }, { unique: true });

  return schema;
})();

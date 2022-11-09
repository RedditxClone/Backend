import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';
import { Types } from 'mongoose';

export type BlockDocument = Block & Document;
@Schema()
export class Block {
  @Prop({ required: true, ref: 'User' })
  blocker: Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  blocked: Types.ObjectId;
}

export const BlockSchema = (() => {
  const schema = SchemaFactory.createForClass(Block);
  schema.index({ blocker: 1, blocked: 1 }, { unique: true });

  return schema;
})();

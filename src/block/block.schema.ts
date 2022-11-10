import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';
import mongoose from 'mongoose';

// import { User } from '../user/user.schema';

export type BlockDocument = Block & Document;
@Schema()
export class Block {
  @Prop({ required: true, ref: 'User', type: mongoose.Schema.Types.ObjectId })
  blocker: mongoose.Types.ObjectId;

  @Prop({ required: true, ref: 'User', type: mongoose.Schema.Types.ObjectId })
  blocked: mongoose.Types.ObjectId;
}

export const BlockSchema = (() => {
  const schema = SchemaFactory.createForClass(Block);
  schema.index({ blocker: 1, blocked: 1 }, { unique: true });

  return schema;
})();

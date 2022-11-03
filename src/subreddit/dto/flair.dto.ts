import { Schema } from 'mongoose';

export class FlairDto {
  _id: Schema.Types.ObjectId;
  text: string;
  backgroundColor: string;
  textColor: boolean;
  modOnly: boolean;
  allowUserEdits: boolean;
  flairAllow: number;
  emojiNumbers: number;
}

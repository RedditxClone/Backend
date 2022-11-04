import { IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class FlairDto {
  _id?: mongoose.Types.ObjectId;
  @IsNotEmpty()
  text: string;
  @IsNotEmpty()
  backgroundColor: string;
  @IsNotEmpty()
  textColor: string;
}

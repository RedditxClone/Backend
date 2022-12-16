import { IsNotEmpty, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class FlairDto {
  //TODO:
  // what if the user sent _id?
  @IsOptional()
  _id?: mongoose.Types.ObjectId;

  @IsNotEmpty()
  text: string;

  @IsNotEmpty()
  backgroundColor: string;

  @IsNotEmpty()
  textColor: string;
}

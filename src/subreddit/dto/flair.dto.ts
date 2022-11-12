import { Optional } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class FlairDto {
  //TODO:
  // what if the user sent _id?
  @Optional()
  _id?: mongoose.Types.ObjectId;

  @IsNotEmpty()
  text: string;

  @IsNotEmpty()
  backgroundColor: string;

  @IsNotEmpty()
  textColor: string;
}

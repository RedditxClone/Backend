import { Optional } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class RuleDto {
  @IsNotEmpty()
  rule: string;

  @IsNotEmpty()
  to: number;

  @IsNotEmpty()
  reason?: string;

  @Optional()
  description?: string;

  @IsNotEmpty()
  createdDate: Date;

  @Optional()
  _id?: mongoose.Types.ObjectId;
}

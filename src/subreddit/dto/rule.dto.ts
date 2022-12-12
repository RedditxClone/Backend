import { Optional } from '@nestjs/common';
import { IsNotEmpty, Max, Min } from 'class-validator';
import mongoose from 'mongoose';

export class RuleDto {
  @IsNotEmpty()
  rule: string;

  @IsNotEmpty()
  @Max(2)
  @Min(0)
  to: number;

  @Optional()
  reason?: string;

  @Optional()
  description?: string;

  @Optional()
  _id?: mongoose.Types.ObjectId;
}

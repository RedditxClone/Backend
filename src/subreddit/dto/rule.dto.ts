import { IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import mongoose from 'mongoose';

export class RuleDto {
  @IsNotEmpty()
  rule: string;

  @IsNotEmpty()
  @Max(2)
  @Min(0)
  to: number;

  @IsOptional()
  reason?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  _id?: mongoose.Types.ObjectId;
}

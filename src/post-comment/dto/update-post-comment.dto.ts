import { IntersectionType } from '@nestjs/mapped-types';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

import { UpdateCommentDto } from '../../comment/dto';
import { UpdatePostDto } from '../../post/dto';

export class UpdatePostCommentDto extends IntersectionType(
  UpdatePostDto,
  UpdateCommentDto,
) {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsMongoId({ message: 'flair must be a mongo id ' })
  flair?: Types.ObjectId;

  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  nsfw?: boolean;

  @IsBoolean()
  @IsOptional()
  spoiler?: boolean;
}

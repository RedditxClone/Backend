import { IntersectionType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';

import { UpdateCommentDto } from '../../comment/dto';
import { UpdatePostDto } from '../../post/dto';

export class UpdatePostCommentDto extends IntersectionType(
  UpdatePostDto,
  UpdateCommentDto,
) {
  @IsString()
  text?: string;

  @IsString()
  flair?: string;
}

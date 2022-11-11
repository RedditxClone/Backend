import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCommentDto {
  @ApiProperty()
  @IsMongoId()
  parentId: Types.ObjectId;

  @ApiProperty()
  @IsMongoId()
  postId: Types.ObjectId;

  @ApiProperty()
  @IsString()
  text: string;
}

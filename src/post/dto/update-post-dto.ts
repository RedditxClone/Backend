import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdatePostDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty()
  @IsOptional()
  @IsMongoId({ message: 'flair must be a mongo id' })
  flair?: Types.ObjectId;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  nsfw?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  spoiler?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  commentsLocked?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  replyNotifications?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdatePostDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsMongoId({ message: 'flair must be a mongo id' })
  flair?: Types.ObjectId;

  @IsOptional()
  @IsBoolean()
  nsfw?: boolean;

  @IsOptional()
  @IsBoolean()
  spoiler?: boolean;
}

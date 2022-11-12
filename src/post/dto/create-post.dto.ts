import {
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreatePostDto {
  @IsMongoId()
  subredditId: Types.ObjectId;

  @IsString()
  title: string;

  @IsString()
  text: string;

  @IsBoolean()
  @IsOptional()
  nsfw?: boolean;

  @IsBoolean()
  @IsOptional()
  spoiler?: boolean;

  @IsMongoId()
  @IsOptional()
  flair?: Types.ObjectId;

  @IsDate()
  @IsOptional()
  publishedDate?: Date;
}

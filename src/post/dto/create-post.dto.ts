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
  nsfw: boolean;

  @IsBoolean()
  spoiler: boolean;

  @IsNotEmpty()
  flairs: Types.ObjectId[];

  @IsDate()
  @IsOptional()
  publishedDate?: Date;
}

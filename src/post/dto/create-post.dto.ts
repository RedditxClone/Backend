import {
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { isValidObjectId, Types } from 'mongoose';

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

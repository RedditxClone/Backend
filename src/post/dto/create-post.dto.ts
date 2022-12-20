import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export enum PostType {
  text,
  images,
  video,
  link,
}
export class CreatePostDto {
  @IsMongoId()
  subredditId: Types.ObjectId;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  text?: string;

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

  @IsEnum(PostType, {
    message: ({ value }) =>
      `${value} must be one of (video, images, text and link)`,
  })
  @IsOptional()
  postType?: string = 'text';
}

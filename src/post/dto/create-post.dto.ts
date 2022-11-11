import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePostDto {
  @IsNotEmpty()
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
  publishedDate: Date;
}

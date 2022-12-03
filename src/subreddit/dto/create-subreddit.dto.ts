import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateSubredditDto {
  @MinLength(3)
  @MaxLength(21)
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  over18: boolean;
}

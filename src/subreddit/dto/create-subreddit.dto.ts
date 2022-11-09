import { IsNotEmpty } from 'class-validator';

export class CreateSubredditDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  type: string;
  @IsNotEmpty()
  over18: boolean;
}

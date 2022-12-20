import {
  IsAlphanumeric,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSubredditDto {
  @MinLength(3)
  @MaxLength(21)
  @IsNotEmpty()
  @IsAlphanumeric(undefined, {
    message: ({ value }) => `${value} mustn't contain special characters`,
  })
  name: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  over18: boolean;
}

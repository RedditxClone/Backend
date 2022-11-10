import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail(undefined, { message: 'must be a valid email' })
  readonly email: string;

  @IsNotEmpty()
  readonly username: string;

  @MinLength(8, { message: 'Password Must have at least 8 characters' })
  readonly password: string;
}

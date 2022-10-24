import { IsEmail, IsNotEmpty, IsNumber, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail(null, { message: 'must be a valid email' })
  readonly email: string;

  @IsNotEmpty()
  readonly username: string;

  @IsNumber()
  @IsNotEmpty()
  readonly age: number;

  @MinLength(8, { message: 'Password Must have at least 8 characters' })
  readonly password: string;
}

import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserFacebookGoogleDto {
  @IsEmail(undefined, { message: 'must be a valid email' })
  email: string;

  @IsNotEmpty()
  username: string;

  @IsEmail(undefined, { message: 'must be a valid email' })
  continueWithGoogleAccount: string;
}

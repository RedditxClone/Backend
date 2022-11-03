import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'The email of the account', required: true })
<<<<<<< HEAD
  email: string;

||||||| ceebe63
  email: string;
=======
  @IsEmail()
  readonly email: string;
>>>>>>> development
  @ApiProperty({ description: 'The password of the account', required: true })
  @IsNotEmpty()
  readonly password: string;
}

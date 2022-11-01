import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'The email of the account', required: true })
  @IsEmail()
  readonly email: string;
  @ApiProperty({ description: 'The password of the account', required: true })
  @IsNotEmpty()
  readonly password: string;
}

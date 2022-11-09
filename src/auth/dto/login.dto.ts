import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'The email of the account', required: true })
  @IsString()
  readonly username: string;

  @ApiProperty({ description: 'The password of the account', required: true })
  @IsNotEmpty()
  readonly password: string;
}

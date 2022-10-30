import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'The email of the account', required: true })
  email: string;

  @ApiProperty({ description: 'The password of the account', required: true })
  password: string;
}

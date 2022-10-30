import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordDto {
  @ApiProperty({
    description: 'The email of the user to reset the password',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'The Username of the user to reset the password',
    required: true,
  })
  username: string;
}

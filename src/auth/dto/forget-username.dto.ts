import { ApiProperty } from '@nestjs/swagger';

export class ForgetUsernameDto {
  @ApiProperty({
    description: 'The email of the user to reset the password',
    required: true,
  })
  email: string;
}

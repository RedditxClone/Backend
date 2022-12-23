import { ApiProperty } from '@nestjs/swagger';
/**
 * Data Transfer Object
 */
export class SignupDto {
  @ApiProperty({
    description: 'The new email of the user to be created',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'The password of the new account',
    required: true,
  })
  password: string;

  @ApiProperty({
    description: 'The name of the new account',
    required: true,
  })
  userName: string;
}

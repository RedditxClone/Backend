import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgetUsernameDto {
  @ApiProperty({
    description: 'The email of the user to reset the password',
    required: true,
  })
  @IsEmail(undefined, { message: 'must be a valid email' })
  email: string;
}

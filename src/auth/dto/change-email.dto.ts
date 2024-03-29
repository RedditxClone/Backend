import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
/**
 * Data Transfer Object
 */
export class ChangeEmailDto {
  @ApiProperty({ description: 'The user password', required: true })
  @IsString()
  password: string;

  @ApiProperty({ description: 'The new email', required: true })
  @IsString()
  email: string;
}

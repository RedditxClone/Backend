import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'The old password', required: true })
  @IsString()
  oldPassword: string;
  @ApiProperty({ description: 'The new password to be reset', required: true })
  @IsString()
  newPassword: string;
}

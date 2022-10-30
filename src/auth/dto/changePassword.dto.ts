import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'The old password', required: true })
  oldPassword: string;
  @ApiProperty({ description: 'The new password to be reset', required: true })
  newPassword: string;
}

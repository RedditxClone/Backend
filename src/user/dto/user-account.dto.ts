import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserAccountDto {
  @ApiProperty({ description: 'The account user name' })
  userName: string;

  @ApiProperty({ description: 'The account icon' })
  @ApiPropertyOptional()
  icon?: string;
}

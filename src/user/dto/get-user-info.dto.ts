import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetUserInfoDto {
  @ApiProperty({ description: 'The account user name' })
  userName: string;

  @ApiProperty({ description: 'The account icon' })
  @ApiPropertyOptional()
  icon?: string;

  @ApiProperty({ description: 'The karmas that user have' })
  karma: number;

  @ApiProperty({ description: 'The karmas that user have' })
  cakeDay: Date;
}

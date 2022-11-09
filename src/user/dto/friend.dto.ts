import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FriendDto {
  @ApiProperty({ description: 'If of the friend' })
  _id: string;

  @ApiProperty({ description: 'Name of the friend' })
  userName: string;

  @ApiPropertyOptional()
  @ApiProperty({ description: 'User icon' })
  icon: string;
}

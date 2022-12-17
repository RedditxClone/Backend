import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetUserInfoDto {
  @ApiProperty({ description: 'The account user name' })
  username: string;

  @ApiProperty({ description: 'The account photo' })
  @ApiPropertyOptional()
  photo: string;

  @ApiProperty({ description: 'the account id' })
  id: string;

  @ApiProperty({ description: 'if i follow this user or not' })
  isFollowed: boolean;
}

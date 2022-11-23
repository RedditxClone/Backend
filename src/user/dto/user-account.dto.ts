import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class UserAccountDto {
  @ApiProperty({ description: 'The account user name' })
  username: string;

  @ApiProperty({ description: 'The account icon' })
  profilePhoto: string;

  @ApiProperty({ description: 'id of current user' })
  _id: Types.ObjectId;
}

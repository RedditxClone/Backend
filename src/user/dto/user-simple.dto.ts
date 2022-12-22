import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class UserSimpleDto {
  @ApiProperty({ type: String, description: 'Id of a user' })
  _id: Types.ObjectId;

  @ApiProperty()
  username: string;

  @ApiProperty()
  profilePhoto: string;
}

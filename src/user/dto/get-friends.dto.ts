import { ApiProperty } from '@nestjs/swagger';
import { FriendDto } from './friend.dto';

export class getFriendsDto {
  @ApiProperty({ description: 'Array of friends' })
  friends: FriendDto[];
}

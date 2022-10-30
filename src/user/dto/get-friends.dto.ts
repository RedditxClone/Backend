import { ApiProperty } from '@nestjs/swagger';

import type { FriendDto } from './friend.dto';

export class GetFriendsDto {
  @ApiProperty({ description: 'Array of friends' })
  friends: FriendDto[];
}

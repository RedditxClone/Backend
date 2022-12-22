import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

import type { SocialLink } from '../user.schema';

export class UserAccountDto {
  @ApiProperty({ description: 'The account user name' })
  username: string;

  @ApiProperty({ description: 'The account icon' })
  profilePhoto: string;

  @ApiProperty({ description: 'The account cover' })
  coverPhoto: string;

  @ApiProperty({ description: "The user's about" })
  about: string;

  @ApiProperty({ description: "The user's preferred display name" })
  displayName: string;

  @ApiProperty({ description: "The user's social links like linkedin" })
  socialLinks?: SocialLink[];

  @ApiProperty({ description: "The user's account is +18 content" })
  nsfw: boolean;

  @ApiProperty({ description: 'id of current user' })
  _id: Types.ObjectId;

  @ApiProperty({ description: `The CakeDay of the user's account` })
  createdAt: Date;

  @ApiProperty({ description: `true if followed by current user` })
  isFollowed: boolean;

  @ApiProperty({ description: `true if blocked by current user` })
  isBlocked: boolean;
}

import { ApiProperty, PartialType } from '@nestjs/swagger';

import { PrefsDto } from './prefs.dto';

export class ReturnedUserDto extends PartialType(PrefsDto) {
  @ApiProperty({ description: 'username of a user' })
  username: string;

  @ApiProperty({ description: 'email of a user' })
  email: string;
}

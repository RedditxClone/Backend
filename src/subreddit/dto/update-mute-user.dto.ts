import { PartialType } from '@nestjs/swagger';

import { MuteUserDto } from './mute-user.dto';

export class UpdateMutedUserDto extends PartialType(MuteUserDto) {}

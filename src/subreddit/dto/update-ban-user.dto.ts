import { PartialType } from '@nestjs/swagger';

import { BanUserDto } from './ban-user.dto';

export class UpdateBannedUserDto extends PartialType(BanUserDto) {}

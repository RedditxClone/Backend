import { IntersectionType } from '@nestjs/swagger';

import { PrefsDto } from './prefs.dto';
import { UserAccountDto } from './user-account.dto';

export class MeDto extends IntersectionType(UserAccountDto, PrefsDto) {}

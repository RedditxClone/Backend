import { PartialType } from '@nestjs/swagger';

import { FlairDto } from './flair.dto';

export class UpdateFlairDto extends PartialType(FlairDto) {}

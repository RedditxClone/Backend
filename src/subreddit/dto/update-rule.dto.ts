import { PartialType } from '@nestjs/swagger';

import { RuleDto } from './rule.dto';

export class UpdateRuleDto extends PartialType(RuleDto) {}

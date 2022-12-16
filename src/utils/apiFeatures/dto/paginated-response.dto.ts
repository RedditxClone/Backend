import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { PaginationMetaDto } from './pagination-meta.dto';

export class PaginatedResponseDto<T = any> {
  @IsArray()
  @ApiProperty({
    isArray: true,
  })
  readonly data: T[];

  @ApiProperty({ type: PaginationMetaDto })
  readonly meta: PaginationMetaDto;
}

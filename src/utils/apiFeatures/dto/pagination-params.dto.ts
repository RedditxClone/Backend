import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max } from 'class-validator';

export class PaginationParamsDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  @IsOptional()
  readonly page: number = 1; // default value

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 75,
    default: 15,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(75) // max allowed results per page
  @IsOptional()
  readonly limit: number = 15; // default value
}

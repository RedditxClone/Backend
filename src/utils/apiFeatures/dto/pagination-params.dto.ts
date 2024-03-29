import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive, Max } from 'class-validator';
export enum SortTypes {
  top,
  hot,
  best,
  new,
  old,
  comments,
}

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

  @ApiPropertyOptional({
    description: 'may be top, hot, best or new and the default is new',
  })
  @IsEnum(SortTypes, {
    message: ({ value }) =>
      `${value} must one of the types(top, hot, new, best, old, comments)`,
  })
  readonly sort: string = 'new';
}

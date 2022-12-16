import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ThingType {
  Post,
  Comment,
}

export class ThingTypeDto {
  @IsString()
  @IsEnum(ThingType, {
    message: ({ value }) =>
      `${value} is not a type, it must be Post or Comment`,
  })
  @IsOptional()
  type?: string;
}

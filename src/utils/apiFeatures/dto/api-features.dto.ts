import { IsOptional } from 'class-validator';

export class ApiFeaturesOptionsDto {
  @IsOptional()
  sort?: boolean;

  @IsOptional()
  pagination?: boolean;

  @IsOptional()
  fields?: boolean;

  @IsOptional()
  searchBy?: boolean;
}

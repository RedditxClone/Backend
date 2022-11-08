import { Optional } from '@nestjs/common';

export class ApiFeaturesOptionsDto {
  @Optional()
  sort?: boolean;
  @Optional()
  pagination?: boolean;
  @Optional()
  fields?: boolean;
  @Optional()
  searchBy?: boolean;
}

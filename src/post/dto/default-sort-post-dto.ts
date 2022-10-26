import { ApiProperty } from '@nestjs/swagger';

export class DefaultSortPostDto {
  @ApiProperty()
  sort: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class GetSearchDto {
  @ApiProperty({ description: 'search text' })
  text: string;
  @ApiProperty({ description: 'search link' })
  href: string;
}

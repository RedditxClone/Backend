import { ApiProperty } from '@nestjs/swagger';

export class GeneralSearchDto {
  @ApiProperty({
    description: 'text to be search about',
    required: true,
  })
  text: string;

  @ApiProperty({
    description:
      'filter search by sending elements to search for, default * means search in all things',
    default: '*',
    required: false,
  })
  searchFor: string;
}

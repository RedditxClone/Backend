import { ApiProperty } from '@nestjs/swagger';

export class TextDto {
  @ApiProperty()
  text: string;
}

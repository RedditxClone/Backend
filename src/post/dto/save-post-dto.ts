import { ApiProperty } from '@nestjs/swagger';

export class SavePostDto {
  @ApiProperty()
  category: string;
}

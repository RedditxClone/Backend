import { ApiProperty } from '@nestjs/swagger';

export class SpamPostDto {
  @ApiProperty()
  message: string;
}

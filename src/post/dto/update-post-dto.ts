import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty()
  subredditId: string;

  @ApiProperty()
  text: string;
}

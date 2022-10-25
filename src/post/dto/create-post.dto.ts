import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty()
  subredditId: string;
  @ApiProperty()
  text: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class FollowPostDto {
  @ApiProperty()
  follow: boolean;
}

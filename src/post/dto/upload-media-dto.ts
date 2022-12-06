import { ApiProperty } from '@nestjs/swagger';
export class UploadMediaDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  mediaIds: string[];
}

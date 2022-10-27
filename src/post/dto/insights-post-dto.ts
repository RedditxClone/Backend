import { ApiProperty } from '@nestjs/swagger';

export class InsightsPostDto {
  @ApiProperty()
  insightsCount: number;
}

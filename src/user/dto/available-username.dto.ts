import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AvailableUsernameDto {
  @ApiProperty({ description: 'The requested username' })
  @IsString()
  username: string;
}

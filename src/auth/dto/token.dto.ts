import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    description: 'The token for google or github',
    required: true,
  })
  token: string;
}

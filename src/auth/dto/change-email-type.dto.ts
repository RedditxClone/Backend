import { ApiProperty } from '@nestjs/swagger';

export class ChangeEmailTypeDto {
  @ApiProperty({
    description: 'The next operation of change email',
    enum: ['createPassword', 'changeEmail'],
  })
  operationType: string;
}

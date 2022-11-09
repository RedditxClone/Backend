import { Optional } from '@nestjs/common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

import { CreateUserDto } from './user.dto';

export class FilterUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: 'id of the user' })
  @IsNotEmpty()
  @Optional()
  _id?: Types.ObjectId;
}

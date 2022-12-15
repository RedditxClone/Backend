import { Optional } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';

export class BanUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  reason: string;

  @IsNotEmpty()
  modNote?: string;

  @IsNotEmpty()
  permanent: boolean;

  @Optional()
  duration?: string;

  @Optional()
  message?: string;
}

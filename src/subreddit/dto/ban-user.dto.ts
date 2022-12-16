import { IsNotEmpty, IsOptional } from 'class-validator';

export class BanUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  reason: string;

  @IsNotEmpty()
  modNote?: string;

  @IsNotEmpty()
  permanent: boolean;

  @IsOptional()
  duration?: string;

  @IsOptional()
  message?: string;
}

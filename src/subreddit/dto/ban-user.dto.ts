import { IsNotEmpty, IsOptional } from 'class-validator';

export class BanUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  reason: string;

  @IsOptional()
  modNote?: string;

  @IsOptional()
  permanent?: boolean;

  @IsOptional()
  duration?: string;

  @IsOptional()
  message?: string;
}

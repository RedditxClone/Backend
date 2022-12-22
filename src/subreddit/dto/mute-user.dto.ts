import { IsNotEmpty } from 'class-validator';

export class MuteUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  reason?: string;
}

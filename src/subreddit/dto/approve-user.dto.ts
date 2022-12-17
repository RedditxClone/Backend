import { IsNotEmpty } from 'class-validator';

export class ApproveUserDto {
  @IsNotEmpty()
  username: string;
}

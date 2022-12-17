/* eslint-disable unicorn/filename-case */
import { IsNotEmpty } from 'class-validator';

export class ActiveTopicsDto {
  @IsNotEmpty()
  activeTopic: string;
}

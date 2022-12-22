/* eslint-disable unicorn/filename-case */
import { ArrayMinSize, IsNotEmpty } from 'class-validator';

export class SubTopicsDto {
  @IsNotEmpty()
  @ArrayMinSize(1)
  subTopics: string[];
}

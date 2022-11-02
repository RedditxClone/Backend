import { PartialType } from '@nestjs/swagger';
import { subredditDto } from './subreddit.dto';

export class UpdateSubredditDto extends PartialType(subredditDto) {}

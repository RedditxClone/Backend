import { PartialType } from '@nestjs/swagger';
import { SubredditDto } from './subreddit.dto';

export class UpdateSubredditDto extends PartialType(SubredditDto) {}

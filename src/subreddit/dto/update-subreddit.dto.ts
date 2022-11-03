import { PartialType } from '@nestjs/swagger';
import { CreateSubredditDto } from './create-subreddit.dto';

export class UpdateSubredditDto extends PartialType(CreateSubredditDto) {}

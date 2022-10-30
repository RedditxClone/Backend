import { Injectable } from '@nestjs/common';

import type { CreateSubredditDto } from './dto/create-subreddit.dto';
import type { UpdateSubredditDto } from './dto/update-subreddit.dto';

@Injectable()
export class SubredditService {
  create(_createSubredditDto: CreateSubredditDto) {
    return 'This action adds a new subreddit';
  }

  findAll() {
    return `This action returns all subreddit`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subreddit`;
  }

  update(id: number, _updateSubredditDto: UpdateSubredditDto) {
    return `This action updates a #${id} subreddit`;
  }

  remove(id: number) {
    return `This action removes a #${id} subreddit`;
  }
}

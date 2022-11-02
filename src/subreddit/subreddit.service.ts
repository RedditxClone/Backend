import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSubredditDto } from './dto/create-subreddit.dto';
import { UpdateSubredditDto } from './dto/update-subreddit.dto';
import { Subreddit } from './subreddit.schema';

@Injectable()
export class SubredditService {
  constructor(
    @InjectModel('subreddit') private readonly subredditModel: Model<Subreddit>,
  ) {}

  create(createSubredditDto: CreateSubredditDto) {
    this.subredditModel.insertMany(createSubredditDto);
  }

  findAll() {
    return `This action returns all subreddit`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subreddit`;
  }

  update(id: number, updateSubredditDto: UpdateSubredditDto) {
    return `This action updates a #${id} subreddit`;
  }

  remove(id: number) {
    return `This action removes a #${id} subreddit`;
  }
}

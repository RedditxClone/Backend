import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSubredditDto } from './dto/create-subreddit.dto';
import { FlairDto } from './dto/flair.dto';
import { UpdateSubredditDto } from './dto/update-subreddit.dto';
import { Subreddit } from './subreddit.schema';

@Injectable()
export class SubredditService {
  constructor(
    @InjectModel('subreddit') private readonly subredditModel: Model<Subreddit>,
  ) {}

  create(createSubredditDto: CreateSubredditDto) {
    return this.subredditModel.insertMany(createSubredditDto);
  }

  findAll() {
    return this.subredditModel.find();
  }

  async createPostFlair(subreddit: string, flairDto: FlairDto) {
    return await this.subredditModel.findByIdAndUpdate(subreddit, {
      $push: { postFlairs: flairDto },
    });
  }

  async createUserFlair(subreddit: string, flairDto: FlairDto) {
    return await this.subredditModel.findByIdAndUpdate(subreddit, {
      $push: { userFlairs: flairDto },
    });
  }

  async getFlairs(subreddit: string, type: boolean) {
    return await this.subredditModel
      .findById(subreddit)
      .select(type ? 'postFlairs' : 'userFlairs');
  }

  findOne(id: number) {
    return this.subredditModel.findById(id);
  }

  update(id: number, updateSubredditDto: UpdateSubredditDto) {
    return `This action updates a #${id} subreddit`;
  }

  remove(id: number) {
    return `This action removes a #${id} subreddit`;
  }
}

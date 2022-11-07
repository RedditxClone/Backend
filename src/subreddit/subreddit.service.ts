import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateSubredditDto } from './dto/create-subreddit.dto';
import { FlairDto } from './dto/flair.dto';
import * as sharp from 'sharp';
import { Subreddit, SubredditDocument } from './subreddit.schema';
import { UpdateSubredditDto } from './dto/update-subreddit.dto';
import { throwIfNullObject } from '../utils/throwException';
import { unlink } from 'fs/promises';
@Injectable()
export class SubredditService {
  constructor(
    @InjectModel('subreddit') private readonly subredditModel: Model<Subreddit>,
  ) {}

  async create(
    createSubredditDto: CreateSubredditDto,
  ): Promise<SubredditDocument> {
    const subreddit: SubredditDocument = await this.subredditModel.create(
      createSubredditDto,
    );
    return subreddit;
  }

  async findSubreddit(subreddit: string): Promise<SubredditDocument> {
    return throwIfNullObject(
      await this.subredditModel.findById(subreddit),
      'No subreddit with such id',
    );
  }

  async update(subreddit: string, updateSubredditDto: UpdateSubredditDto) {
    throwIfNullObject(
      await this.subredditModel
        .findByIdAndUpdate(subreddit, updateSubredditDto)
        .select('_id'),
      'No subreddit with such id',
    );
    return {
      status: 'success',
    };
  }

  async createFlair(
    subreddit: string,
    flairDto: FlairDto,
  ): Promise<SubredditDocument> {
    flairDto._id = new mongoose.Types.ObjectId();
    return throwIfNullObject(
      await this.subredditModel
        .findByIdAndUpdate(
          subreddit,
          {
            $push: { flairList: flairDto },
          },
          { new: true },
        )
        .select('flairList'),
      'No subreddit with such id',
    );
  }

  async getFlairs(subreddit: string): Promise<SubredditDocument> {
    return throwIfNullObject(
      await this.subredditModel.findById(subreddit).select('flairList'),
      'No subreddit with such id',
    );
  }

  async uploadIcon(subreddit: string, file) {
    const saveDir = `statics/subreddit_icons/${subreddit}.jpeg`;
    throwIfNullObject(
      await this.subredditModel.findById(subreddit).select('_id'),
      'No subreddit with such id',
    );
    await Promise.all([
      sharp(file.buffer).toFormat('jpeg').toFile(saveDir),
      this.subredditModel
        .findByIdAndUpdate(subreddit, {
          icon: saveDir,
        })
        .select(''),
    ]);
    return {
      icon: saveDir,
    };
  }

  async removeIcon(subreddit: string) {
    const saveDir = `statics/subreddit_icons/${subreddit}.jpeg`;
    throwIfNullObject(
      (
        await Promise.all([
          unlink(saveDir),
          this.subredditModel
            .findByIdAndUpdate(subreddit, {
              icon: null,
            })
            .select(''),
        ])
      )[1],
      'No subreddit with such id',
    );
    return { status: 'success' };
  }

  async deleteFlairById(subreddit: string, flair_id: string) {
    const flair = throwIfNullObject(
      await this.subredditModel.findByIdAndUpdate(subreddit, {
        $pull: {
          flairList: { _id: new mongoose.Types.ObjectId(flair_id) },
        },
      }),
      'No subreddit with such id',
    );
    return { status: 'success' };
  }

  getHotSubreddits(subreddit: string) {
    return 'Waiting for api features to use the sort function';
  }
}

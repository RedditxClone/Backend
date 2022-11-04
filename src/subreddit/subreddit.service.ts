import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateSubredditDto } from './dto/create-subreddit.dto';
import { FlairDto } from './dto/flair.dto';
import { unlinkSync } from 'node:fs';
import * as sharp from 'sharp';
import { Subreddit, SubredditDocument } from './subreddit.schema';
import { UpdateSubredditDto } from './dto/update-subreddit.dto';
import { throwIfNullObject } from '../utils/throwException';
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

  async updateSubreddit(
    subreddit: string,
    updateSubredditDto: UpdateSubredditDto,
  ): Promise<SubredditDocument> {
    return throwIfNullObject(
      await this.subredditModel.findByIdAndUpdate(
        subreddit,
        updateSubredditDto,
        { new: true },
      ),
      'No subreddit with such id',
    );
  }

  async createFlair(
    subreddit: string,
    flairDto: FlairDto,
  ): Promise<SubredditDocument> {
    flairDto._id = new mongoose.Types.ObjectId();
    return throwIfNullObject(
      await this.subredditModel.findByIdAndUpdate(
        subreddit,
        {
          $push: { flairList: flairDto },
        },
        { new: true },
      ),
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
      this.subredditModel.findByIdAndUpdate(subreddit, {
        icon: saveDir,
      }),
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
          unlinkSync(saveDir),
          this.subredditModel.findByIdAndUpdate(subreddit, {
            icon: null,
          }),
        ])
      )[1],
      'No subreddit with such id',
    );
    return { status: 'success' };
  }

  async deleteFlairById(subreddit: string, flair_id: string) {
    return throwIfNullObject(
      await this.subredditModel
        .findByIdAndUpdate(
          subreddit,
          {
            $pull: {
              flairList: { _id: new mongoose.Types.ObjectId(flair_id) },
            },
          },
          { new: true },
        )
        .select('flairList'),
      'No subreddit with such id',
    );
  }

  getHotSubreddits(subreddit: string) {
    return 'Waiting for api features to use the sort function';
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { unlink } from 'fs/promises';
import mongoose, { Model } from 'mongoose';
import sharp from 'sharp';

import type { CreateSubredditDto } from './dto/create-subreddit.dto';
import type { FlairDto } from './dto/flair.dto';
import type { UpdateSubredditDto } from './dto/update-subreddit.dto';
import type { Subreddit, SubredditDocument } from './subreddit.schema';
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
    const sr: SubredditDocument | null | undefined =
      await this.subredditModel.findById(subreddit);

    if (!sr) {
      throw new NotFoundException('No subreddit with such id');
    }

    return sr;
  }

  async update(subreddit: string, updateSubredditDto: UpdateSubredditDto) {
    const sr: SubredditDocument | null | undefined = await this.subredditModel
      .findByIdAndUpdate(subreddit, updateSubredditDto)
      .select('_id');

    if (!sr) {
      throw new NotFoundException('No subreddit with such id');
    }

    return {
      status: 'success',
    };
  }

  async createFlair(
    subreddit: string,
    flairDto: FlairDto,
  ): Promise<SubredditDocument> {
    flairDto._id = new mongoose.Types.ObjectId();
    const sr: SubredditDocument | null | undefined = await this.subredditModel
      .findByIdAndUpdate(
        subreddit,
        {
          $push: { flairList: flairDto },
        },
        { new: true },
      )
      .select('flairList');

    if (!sr) {
      throw new NotFoundException('No subreddit with such id');
    }

    return sr;
  }

  async getFlairs(subreddit: string): Promise<SubredditDocument> {
    const sr = await this.subredditModel
      .findById(subreddit)
      .select('flairList');

    if (!sr) {
      throw new NotFoundException('No subreddit with such id');
    }

    return sr;
  }

  async uploadIcon(subreddit: string, file) {
    const saveDir = `src/statics/subreddit_icons/${subreddit}.jpeg`;
    const sr = await this.subredditModel.findById(subreddit).select('_id');

    if (!sr) {
      throw new NotFoundException('No subreddit with such id');
    }

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
    const saveDir = `src/statics/subreddit_icons/${subreddit}.jpeg`;
    const sr = await this.subredditModel
      .findByIdAndUpdate(subreddit, {
        icon: null,
      })
      .select('');

    if (!sr) {
      throw new NotFoundException('No subreddit with such id');
    }

    try {
      await unlink(saveDir);
    } catch {
      throw new BadRequestException({
        description: "The subreddit doesn't have already an icon",
      });
    }

    return { status: 'success' };
  }

  async deleteFlairById(subreddit: string, flair_id: string) {
    const flair = await this.subredditModel.findByIdAndUpdate(subreddit, {
      $pull: {
        flairList: { _id: new mongoose.Types.ObjectId(flair_id) },
      },
    });

    if (!flair) {
      throw new NotFoundException('No subreddit with such id');
    }

    return { status: 'success' };
  }

  getHotSubreddits(_subreddit: string) {
    return 'Waiting for api features to use the sort function';
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import mongoose, { Model } from 'mongoose';

import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { ImagesHandlerService } from '../utils/imagesHandler/images-handler.service';
import type { CreateSubredditDto } from './dto/create-subreddit.dto';
import type { FilterSubredditDto } from './dto/filter-subreddit.dto';
import type { FlairDto } from './dto/flair.dto';
import type { RuleDto } from './dto/rule.dto';
import type { UpdateRuleDto } from './dto/update-rule.dto';
import type { UpdateSubredditDto } from './dto/update-subreddit.dto';
import type { Subreddit, SubredditDocument } from './subreddit.schema';
import type { SubredditUser } from './subreddit-user.schema';
@Injectable()
export class SubredditService {
  constructor(
    @InjectModel('Subreddit') private readonly subredditModel: Model<Subreddit>,
    @InjectModel('UserSubreddit')
    private readonly userSubredditModel: Model<SubredditUser>,
    private readonly imagesHandlerService: ImagesHandlerService,
    private readonly apiFeatureService: ApiFeaturesService,
  ) {}

  async create(
    createSubredditDto: CreateSubredditDto,
    user_id: Types.ObjectId,
  ): Promise<SubredditDocument> {
    let subreddit: SubredditDocument | undefined;

    try {
      subreddit = await this.subredditModel.create({
        ...createSubredditDto,
        moderators: [user_id],
      });
    } catch (error) {
      if (error?.message?.startsWith('E11000')) {
        throw new ConflictException(
          `Subreddit with name ${createSubredditDto.name} already exists.`,
        );
      }

      throw error;
    }

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

  async findSubredditByName(subredditName: string): Promise<SubredditDocument> {
    const filter: FilterSubredditDto = { name: subredditName };
    const sr: SubredditDocument | null | undefined =
      await this.subredditModel.findOne(filter);

    if (!sr) {
      throw new NotFoundException('No subreddit with such name');
    }

    return sr;
  }

  async checkSubredditAvailable(subredditName: string) {
    const filter: FilterSubredditDto = { name: subredditName };
    const isSubredditUnavailable = await this.subredditModel.exists(filter);

    if (isSubredditUnavailable) {
      throw new ConflictException('Subreddit name is unavailable');
    }

    return { status: 'success' };
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
    const sr = await this.subredditModel.findById(subreddit).select('_id');

    if (!sr) {
      throw new NotFoundException('No subreddit with such id');
    }

    return this.imagesHandlerService.uploadPhoto(
      'subreddit_icons',
      file,
      this.subredditModel,
      new mongoose.Types.ObjectId(subreddit),
      'icon',
    );
  }

  async removeIcon(subreddit: string) {
    const saveDir = `src/statics/subreddit_icons/${subreddit}.jpeg`;
    const sr = await this.subredditModel
      .findByIdAndUpdate(subreddit, {
        icon: '',
      })
      .select('');

    if (!sr) {
      throw new NotFoundException('No subreddit with such id');
    }

    return this.imagesHandlerService.removePhoto(saveDir);
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

  private async subredditExist(subredditId): Promise<boolean> {
    return (await this.subredditModel.count({ _id: subredditId })) > 0;
  }

  async joinSubreddit(userId: Types.ObjectId, subredditId: Types.ObjectId) {
    const subredditExist = await this.subredditExist(subredditId);

    if (!subredditExist) {
      throw new BadRequestException(
        `there is no subreddit with id ${subredditId}`,
      );
    }

    await this.userSubredditModel.create({
      subredditId,
      userId,
    });

    return { status: 'success' };
  }

  async leaveSubreddit(userId: Types.ObjectId, subredditId: Types.ObjectId) {
    const deleted = await this.userSubredditModel.findOneAndDelete({
      userId,
      subredditId,
    });

    if (!deleted) {
      throw new BadRequestException(
        `user with id ${userId} not joined subreddit with id ${subredditId}`,
      );
    }

    return { status: 'success' };
  }

  getHotSubreddits(_subreddit: string) {
    return 'Waiting for api features to use the sort function';
  }

  getSearchSubredditAggregation(
    searchPhrase: string,
    page,
    numberOfData: number,
  ) {
    const pageNumber = page ?? 1;

    return this.subredditModel.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: searchPhrase } },
            { description: { $regex: searchPhrase } },
          ],
        },
      },
      {
        $lookup: {
          from: 'usersubreddits',
          localField: '_id',
          foreignField: 'subredditId',
          as: 'users',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          users: { $size: '$users' },
        },
      },
      {
        $skip: (pageNumber - 1) * numberOfData,
      },
      {
        $limit: numberOfData,
      },
    ]);
  }

  async addSubredditCategories(
    subreddit: Types.ObjectId,
    userId: Types.ObjectId,
    categories: string[],
  ) {
    const sr = await this.subredditModel.updateOne(
      {
        _id: subreddit,
        moderators: userId,
      },
      {
        $addToSet: { categories: { $each: categories } },
      },
    );

    if (!sr.modifiedCount) {
      throw new BadRequestException();
    }

    return {
      status: 'success',
    };
  }

  getSubredditsWithCategory(category: string, page?: number, limit?: number) {
    return this.apiFeatureService.processQuery(
      this.subredditModel.find({
        categories: category,
      }),
      { page, limit },
      { pagination: true },
    );
  }

  private modifiedCountResponse(modifiedCount, message?) {
    if (modifiedCount === 0) {
      throw new BadRequestException(message);
    }

    return {
      status: 'success',
    };
  }

  async addNewModerator(
    moderatorId: Types.ObjectId,
    newModuratorId: Types.ObjectId,
    subreddit: Types.ObjectId,
  ) {
    const res = await this.subredditModel.updateOne(
      {
        moderators: moderatorId,
        _id: subreddit,
      },
      {
        $addToSet: { moderators: newModuratorId },
      },
    );

    if (res.matchedCount === 0) {
      throw new UnauthorizedException();
    }

    return this.modifiedCountResponse(
      res.modifiedCount,
      'You are already a moderator in that subreddit',
    );
  }

  async subredditIModerate(userId: Types.ObjectId) {
    return this.subredditModel.find({
      moderators: userId,
    });
  }

  async subredditsIJoined(userId: Types.ObjectId) {
    const subreddits = await this.userSubredditModel.aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $lookup: {
          from: 'subreddits',
          localField: 'subredditId',
          foreignField: '_id',
          as: 'subreddit',
        },
      },
    ]);

    return subreddits.map((v) => v.subreddit[0]);
  }

  async getSubredditModerators(subreddit: Types.ObjectId) {
    const subreddits = await this.subredditModel.aggregate([
      {
        $match: {
          _id: subreddit,
        },
      },
      {
        $project: {
          moderators: 1,
        },
      },
      {
        $unset: '_id',
      },
      {
        $unwind: '$moderators',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'moderators',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          user: {
            _id: 1,
            username: 1,
            profilePhoto: 1,
            displayName: 1,
            about: 1,
          },
        },
      },
    ]);

    return subreddits.map((v) => v.user[0]);
  }

  async isJoined(userId: Types.ObjectId, subredditId: Types.ObjectId) {
    const res = await this.userSubredditModel.findOne({
      userId,
      subredditId,
    });

    return Boolean(res);
  }

  async isModerator(userId: Types.ObjectId, subreddit: Types.ObjectId) {
    const res = await this.subredditModel.findOne({
      moderators: userId,
      _id: subreddit,
    });

    return Boolean(res);
  }

  async addRule(
    subreddit: Types.ObjectId,
    userId: Types.ObjectId,
    ruleDto: RuleDto,
  ) {
    ruleDto._id = new mongoose.Types.ObjectId();
    const res = await this.subredditModel.updateOne(
      {
        _id: subreddit,
        moderators: userId,
      },
      {
        $push: { rules: ruleDto },
      },
    );

    if (!res.modifiedCount) {
      throw new NotFoundException();
    }

    return ruleDto;
  }

  async deleteRule(
    subreddit: Types.ObjectId,
    ruleId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const res = await this.subredditModel.updateOne(
      {
        _id: subreddit,
        moderators: userId,
      },
      {
        $pull: {
          rules: { _id: ruleId },
        },
      },
    );

    return this.modifiedCountResponse(res.modifiedCount);
  }

  async updateRule(
    subreddit: Types.ObjectId,
    ruleId: Types.ObjectId,
    userId: Types.ObjectId,
    ruleDto: UpdateRuleDto,
  ) {
    const updatedObject = {};

    // eslint-disable-next-line unicorn/no-array-for-each
    Object.keys(ruleDto).forEach((key) => {
      updatedObject[`rules.$.${key}`] = ruleDto[key];
    });

    const queryObject = {
      _id: subreddit,
      moderators: userId,
    };

    queryObject['rules._id'] = ruleId;

    const res = await this.subredditModel.updateOne(
      queryObject,
      {
        $set: updatedObject,
      },
      {
        runValidators: true,
      },
    );

    return this.modifiedCountResponse(res.modifiedCount);
  }

  async askToJoinSr(subreddit: Types.ObjectId, userId: Types.ObjectId) {
    const res = await this.subredditModel.updateOne(
      {
        _id: subreddit,
      },
      {
        $addToSet: {
          joinList: userId,
        },
      },
    );

    return this.modifiedCountResponse(res.modifiedCount);
  }

  async getUsersAskingToJoinSubreddit(
    subreddit: Types.ObjectId,
    moderatorId: Types.ObjectId,
  ) {
    const res = await this.subredditModel.aggregate([
      {
        $match: {
          $and: [{ _id: subreddit }, { moderators: moderatorId }],
        },
      },
      {
        $project: {
          joinList: 1,
        },
      },
      {
        $unset: '_id',
      },
      {
        $unwind: '$joinList',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'joinList',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          user: {
            _id: 1,
            username: 1,
            profilePhoto: 1,
            displayName: 1,
            about: 1,
          },
        },
      },
    ]);

    return res.map((v) => v.user[0]);
  }

  private async deleteUserFromAskingListIfSrExist(
    subreddit: Types.ObjectId,
    moderatorId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const res = await this.subredditModel.updateOne(
      {
        _id: subreddit,
        moderators: moderatorId,
      },
      {
        $pull: {
          joinList: userId,
        },
      },
    );

    if (!res.matchedCount) {
      throw new BadRequestException();
    }

    if (!res.modifiedCount) {
      throw new BadRequestException("User didn't send request to join the sr");
    }

    return { status: 'success' };
  }

  async acceptToJoinSr(
    subredditId: Types.ObjectId,
    moderatorId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    await this.deleteUserFromAskingListIfSrExist(
      subredditId,
      moderatorId,
      userId,
    );

    await this.userSubredditModel.create({
      subredditId,
      userId,
    });

    return { status: 'success' };
  }

  private getUserInNestedArrayAggregation(
    subredditId: Types.ObjectId,
    userId: Types.ObjectId,
    fieldName: string,
  ) {
    const prjectField = {};
    prjectField[fieldName] = 1;

    return this.subredditModel.aggregate([
      {
        $match: {
          $and: [{ _id: subredditId }, { moderators: userId }],
        },
      },
      { $project: prjectField },
      { $unwind: `${fieldName}` },
      {
        $lookup: {
          from: 'users',
          localField: `${fieldName}`,
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: 'user',
      },
      {
        $project: {
          _id: 1,
          username: 1,
          profilePhoto: 1,
          displayName: 1,
          about: 1,
          date: 1,
        },
      },
    ]);
  }

  async muteUser(
    subredditId: Types.ObjectId,
    moderatorId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const res = await this.subredditModel.updateOne(
      {
        $and: [
          { _id: subredditId },
          { moderators: moderatorId },
          { moderators: { $ne: userId } },
        ],
      },
      {
        $push: {
          mutedUsers: {
            userId,
          },
        },
      },
    );

    return this.modifiedCountResponse(res.modifiedCount);
  }

  async unMuteUser(
    subredditId: Types.ObjectId,
    moderatorId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const res = await this.subredditModel.updateOne(
      {
        $and: [{ _id: subredditId }, { moderators: moderatorId }],
      },
      {
        $pull: {
          mutedUsers: {
            userId,
          },
        },
      },
    );

    return this.modifiedCountResponse(res.modifiedCount);
  }

  async getMutedUsers(subredditId: Types.ObjectId, userId: Types.ObjectId) {
    return this.getUserInNestedArrayAggregation(
      subredditId,
      userId,
      'mutedUsers',
    );
  }
}

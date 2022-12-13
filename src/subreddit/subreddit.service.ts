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
    username: string,
  ): Promise<SubredditDocument> {
    let subreddit: SubredditDocument | undefined;

    try {
      subreddit = await this.subredditModel.create({
        ...createSubredditDto,
        moderators: [username],
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
            { name: { $regex: searchPhrase, $options: 'i' } },
            { description: { $regex: searchPhrase, $options: 'i' } },
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

  getSearchFlairsAggregate(
    searchPhrase: string,
    subreddit: Types.ObjectId,
    page,
    numberOfData: number,
  ) {
    const pageNumber = page ?? 1;

    return this.subredditModel.aggregate([
      {
        $match: {
          _id: subreddit,
        },
      },
      {
        $project: {
          flair: '$flairList',
        },
      },
      {
        $unwind: '$flair',
      },
      {
        $match: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'flair.text': { $regex: searchPhrase, $options: 'i' },
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
    username: string,
    categories: string[],
  ) {
    const sr = await this.subredditModel.updateOne(
      {
        _id: subreddit,
        moderators: username,
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
    moderatorUsername: string,
    newModuratorUsername: string,
    subreddit: Types.ObjectId,
  ) {
    const res = await this.subredditModel.updateOne(
      {
        moderators: moderatorUsername,
        _id: subreddit,
      },
      {
        $addToSet: { moderators: newModuratorUsername },
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

  async subredditIModerate(username: string) {
    return this.subredditModel.find({
      moderators: username,
    });
  }

  async checkIfModerator(subredditId: Types.ObjectId, userId: Types.ObjectId) {
    const moderator = await this.subredditModel.exists({
      moderators: userId,
      _id: subredditId,
    });

    return Boolean(moderator);
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
          foreignField: 'username',
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

  async isModerator(username: string, subreddit: Types.ObjectId) {
    const res = await this.subredditModel.findOne({
      moderators: username,
      _id: subreddit,
    });

    return Boolean(res);
  }

  async addRule(subreddit: Types.ObjectId, username: string, ruleDto: RuleDto) {
    ruleDto._id = new mongoose.Types.ObjectId();
    const res = await this.subredditModel.updateOne(
      {
        _id: subreddit,
        moderators: username,
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
    username: string,
  ) {
    const res = await this.subredditModel.updateOne(
      {
        _id: subreddit,
        moderators: username,
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
    username: string,
    ruleDto: UpdateRuleDto,
  ) {
    const updatedObject = {};

    // eslint-disable-next-line unicorn/no-array-for-each
    Object.keys(ruleDto).forEach((key) => {
      updatedObject[`rules.$.${key}`] = ruleDto[key];
    });

    const queryObject = {
      _id: subreddit,
      moderators: username,
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
    moderatorUsername: string,
  ) {
    const res = await this.subredditModel.aggregate([
      {
        $match: {
          $and: [{ _id: subreddit }, { moderators: moderatorUsername }],
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
    moderatorUsername: string,
    userId: Types.ObjectId,
  ) {
    const res = await this.subredditModel.updateOne(
      {
        _id: subreddit,
        moderators: moderatorUsername,
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
    moderatorUsername: string,
    userId: Types.ObjectId,
  ) {
    await this.deleteUserFromAskingListIfSrExist(
      subredditId,
      moderatorUsername,
      userId,
    );

    await this.userSubredditModel.create({
      subredditId,
      userId,
    });

    return { status: 'success' };
  }

  private async getUserInNestedArrayAggregation(
    subredditId: Types.ObjectId,
    userId: Types.ObjectId,
    fieldName: string,
  ) {
    const prjectField = {};
    prjectField[fieldName] = 1;

    // We don't have to check if the request is bad
    const res = await this.subredditModel.aggregate([
      {
        $match: {
          $and: [{ _id: subredditId }, { moderators: userId }],
        },
      },
      { $project: prjectField },
      { $unset: '_id' },
      { $unwind: `$${fieldName}` },
      {
        $lookup: {
          from: 'users',
          localField: `${fieldName}.username`,
          foreignField: 'username',
          as: 'user',
        },
      },
      {
        $project: {
          mutedUsers: {
            date: 1,
          },
          user: {
            _id: 1,
            username: 1,
            profilePhoto: 1,
            displayName: 1,
            about: 1,
            date: 1,
          },
        },
      },
    ]);

    return res.map((v) => ({ date: v.mutedUsers.date, ...v.user[0] }));
  }

  private async removeUserFromListUserDate(
    subredditId: Types.ObjectId,
    moderatorUsername: string,
    username: string,
    fieldName: string,
  ) {
    const properityObject = {};
    properityObject[fieldName] = {
      username,
    };

    const res = await this.subredditModel.updateOne(
      {
        $and: [{ _id: subredditId }, { moderators: moderatorUsername }],
      },
      {
        $pull: properityObject,
      },
    );

    return this.modifiedCountResponse(res.modifiedCount);
  }

  private async checkIfUserAlreadyProccessed(
    username: string,
    subredditId: Types.ObjectId,
    fieldName: string,
  ) {
    const filter = {};
    filter[`${fieldName}.username`] = username;
    const res = await this.subredditModel.exists({
      ...filter,
      _id: subredditId,
    });

    return Boolean(res);
  }

  private async addUserToListUserDate(
    subredditId: Types.ObjectId,
    moderatorUsername: string,
    username: string,
    fieldName: string,
  ) {
    const isUserAlreadyProccessed = await this.checkIfUserAlreadyProccessed(
      username,
      subredditId,
      fieldName,
    );

    if (isUserAlreadyProccessed) {
      throw new BadRequestException();
    }

    const properityObject = {};
    properityObject[fieldName] = {
      username,
      date: new Date(),
    };

    const res = await this.subredditModel.updateOne(
      {
        $and: [
          { _id: subredditId },
          { moderators: moderatorUsername },
          { moderators: { $ne: username } },
        ],
      },
      {
        $push: properityObject,
      },
    );

    return this.modifiedCountResponse(res.modifiedCount);
  }

  async muteUser(
    subredditId: Types.ObjectId,
    moderatorName: string,
    username: string,
  ) {
    return this.addUserToListUserDate(
      subredditId,
      moderatorName,
      username,
      'mutedUsers',
    );
  }

  async unMuteUser(
    subredditId: Types.ObjectId,
    moderatorName: string,
    username: string,
  ) {
    return this.removeUserFromListUserDate(
      subredditId,
      moderatorName,
      username,
      'mutedUsers',
    );
  }

  async getMutedUsers(subredditId: Types.ObjectId, userId: Types.ObjectId) {
    return this.getUserInNestedArrayAggregation(
      subredditId,
      userId,
      'mutedUsers',
    );
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { PostCommentService } from '../post-comment/post-comment.service';
import { UserService } from '../user/user.service';
import type { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { ImagesHandlerService } from '../utils/imagesHandler/images-handler.service';
import { subredditSelectedFields } from '../utils/project-selected-fields';
import {
  srGetUsersRelated,
  srPagination,
  srProjectionNumOfUsersAndIfIamJoined,
  srProjectionNumOfUsersAndIfModerator,
} from '../utils/subreddit-aggregate-stages';
import type { CreateSubredditDto } from './dto/create-subreddit.dto';
import type { FilterSubredditDto } from './dto/filter-subreddit.dto';
import type { FlairDto } from './dto/flair.dto';
import type { RuleDto } from './dto/rule.dto';
import type { UpdateRuleDto } from './dto/update-rule.dto';
import type { UpdateSubredditDto } from './dto/update-subreddit.dto';
import type { Subreddit, SubredditDocument } from './subreddit.schema';
import type { SubredditUser } from './subreddit-user.schema';
import type { SubredditUserLeft } from './subreddit-user-left.schema';

/**
 * service for subreddit module
 */
@Injectable()
export class SubredditService {
  /**
   * class constructor
   * @param subredditModel subreddit model
   * @param userSubredditModel  user subreddit model
   * @param userSubredditLeftModel user subreddit left
   * @param userService user service
   * @param imagesHandlerService image handler service
   * @param postCommentService post comment service
   */
  constructor(
    @InjectModel('Subreddit')
    private readonly subredditModel: Model<Subreddit>,
    @InjectModel('UserSubreddit')
    private readonly userSubredditModel: Model<SubredditUser>,
    @InjectModel('UserSubredditLeft')
    private readonly userSubredditLeftModel: Model<SubredditUserLeft>,
    private readonly userService: UserService,
    private readonly imagesHandlerService: ImagesHandlerService,
    private readonly postCommentService: PostCommentService,
  ) {}

  /**
   * creates a subreddit
   * @param createSubredditDto encapsulates the creation data
   * @param username the user's suername
   * @param userId the user's id
   * @returns the created subreddit
   */
  async create(
    createSubredditDto: CreateSubredditDto,
    username: string,
    userId: Types.ObjectId,
  ): Promise<SubredditDocument> {
    let subreddit: SubredditDocument | undefined;

    try {
      subreddit = await this.subredditModel.create({
        ...createSubredditDto,
        moderators: [username],
      });

      await this.userSubredditModel.create({
        subredditId: subreddit,
        userId,
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

  /**
   * finds a subreddit
   * @param subreddit the subreddit name
   * @returns the subreddit if found
   */
  async findSubreddit(subreddit: string): Promise<SubredditDocument> {
    const sr: SubredditDocument | null | undefined =
      await this.subredditModel.findById(subreddit);

    if (!sr) {
      throw new NotFoundException('No subreddit with such id');
    }

    return sr;
  }

  /**
   * find the subreddits related to the user
   * @param subredditName the sr name
   * @param user the user
   * @returns the srs
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findSubredditByName(subredditName: string, user?) {
    const sr = await this.subredditModel.aggregate([
      {
        $match: {
          $and: [
            { name: subredditName },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { 'bannedUsers.username': { $ne: user?.username } },
          ],
        },
      },
      srGetUsersRelated(user?._id),
      srProjectionNumOfUsersAndIfModerator(user?._id, user?.username),
    ]);

    if (sr.length === 0) {
      throw new NotFoundException();
    }

    return { ...sr[0], joined: sr[0].joined.length > 0 };
  }

  /**
   * checks if the sr name is available
   * @param subredditName the sr name
   * @returns `{ status: 'success' }` if available
   */
  async checkSubredditAvailable(subredditName: string) {
    const filter: FilterSubredditDto = { name: subredditName };
    const isSubredditUnavailable = await this.subredditModel.exists(filter);

    if (isSubredditUnavailable) {
      throw new ConflictException('Subreddit name is unavailable');
    }

    return { status: 'success' };
  }

  /**
   * updates subreddit
   * @param subreddit sr name
   * @param updateSubredditDto encapsolates the request data
   * @param username the user's username
   * @returns `{ status: 'success' }`
   */
  async update(
    subreddit: string,
    updateSubredditDto: UpdateSubredditDto,
    username,
  ) {
    this.checkUserNotNull(username);

    const sr: SubredditDocument | null | undefined = await this.subredditModel
      .findOneAndUpdate(
        { name: subreddit, moderators: username },
        updateSubredditDto,
        { runValidators: true },
      )
      .select('_id');

    if (!sr) {
      throw new BadRequestException();
    }

    return {
      status: 'success',
    };
  }

  /**
   * creates a subreddit flair
   * @param subreddit the sr name
   * @param flairDto encapsulating flairs data
   * @param username user's username
   * @returns the sr after adding the flair
   */
  async createFlair(
    subreddit: string,
    flairDto: FlairDto,
    username: string,
  ): Promise<SubredditDocument> {
    this.checkUserNotNull(username);
    flairDto._id = new Types.ObjectId(
      Number(Date.now().toString().slice(-8, -1)),
    );
    const sr: SubredditDocument | null | undefined = await this.subredditModel
      .findOneAndUpdate(
        { _id: subreddit, moderators: username },
        {
          $push: { flairList: flairDto },
        },
        { new: true },
      )
      .select('flairList');

    if (!sr) {
      throw new NotFoundException();
    }

    return sr;
  }

  /**
   * updates an element in list
   * @param list the list to be update
   * @param updateDto encapsulates the update data
   * @param updateId update data id
   * @returns updated element
   */
  updateList(list, updateDto, updateId) {
    return list.map((v) => {
      if (v._id.toString() === updateId) {
        // eslint-disable-next-line unicorn/no-array-for-each
        Object.keys(updateDto).forEach((key) => {
          v[key] = updateDto[key];
        });
      }

      return v;
    });
  }

  /**
   * updates an array of objects
   * @param subreddit the sr name
   * @param updateId the list thing id
   * @param updateDto encapsulates the update data
   * @param username the user's username
   * @param updatedField the updated field
   * @returns the updated count
   */
  async updateGeneralArrayOfObjects(
    subreddit,
    updateId,
    updateDto,
    username,
    updatedField: string,
  ) {
    this.checkUserNotNull(username);
    const res = await this.subredditModel
      .findById(subreddit)
      .select(updatedField);

    if (!res) {
      throw new BadRequestException();
    }

    const list = this.updateList(res[updatedField], updateDto, updateId);

    const updateObject = {};
    updateObject[updatedField] = list;

    const res2 = await this.subredditModel.updateOne(
      {
        _id: subreddit,
        moderators: username,
      },
      updateObject,
    );

    return this.modifiedCountResponse(res2.modifiedCount);
  }

  /**
   * gets sr flairs
   * @param subreddit sr name
   * @returns the sr
   */
  async getFlairs(subreddit: string): Promise<SubredditDocument> {
    const sr = await this.subredditModel
      .findById(subreddit)
      .select('flairList');

    if (!sr) {
      throw new NotFoundException('No subreddit with such id');
    }

    return sr;
  }

  /**
   * uploads a sr icon
   * @param subreddit sr name
   * @param file the icon file
   * @param username the user uploading th icon
   */
  async uploadIcon(subreddit: string, file, username: string) {
    const sr = await this.subredditModel
      .findOne({ _id: subreddit, moderators: username })
      .select('_id');

    if (!sr) {
      throw new BadRequestException();
    }

    return this.imagesHandlerService.uploadPhoto(
      'subreddit_icons',
      file,
      this.subredditModel,
      new Types.ObjectId(subreddit),
      'icon',
    );
  }

  /**
   * checks if user is null
   * @param user check if user is not null
   */
  private checkUserNotNull(user) {
    if (!user) {
      throw new UnauthorizedException();
    }
  }

  /**
   * removes sr icon
   * @param subreddit sr name
   * @param username the user' username
   */
  async removeIcon(subreddit: string, username: string) {
    this.checkUserNotNull(username);
    const saveDir = `assets/subreddit_icons/${subreddit}.jpeg`;
    const sr = await this.subredditModel
      .updateOne(
        { _id: subreddit, moderators: username },
        {
          icon: '',
        },
      )
      .select('');

    if (!sr.modifiedCount) {
      throw new BadRequestException();
    }

    return this.imagesHandlerService.removePhoto(saveDir);
  }

  /**
   * deletes a flair with id
   * @param subreddit sr name
   * @param flair_id flair id
   * @param username user's username
   * @returns `{ status: 'success' }`
   */
  async deleteFlairById(subreddit: string, flair_id: string, username: string) {
    this.checkUserNotNull(username);
    const flair = await this.subredditModel.updateOne(
      { _id: subreddit, moderators: username },
      {
        $pull: {
          flairList: { _id: new Types.ObjectId(flair_id) },
        },
      },
    );

    if (!flair.modifiedCount) {
      throw new BadRequestException();
    }

    return { status: 'success' };
  }

  /**
   * checks if sr exist
   * @param subredditId sr id
   * @returns boolean
   */
  private async subredditExist(subredditId): Promise<boolean> {
    return (await this.subredditModel.count({ _id: subredditId })) > 0;
  }

  /**
   * join sr
   * @param userId user id
   * @param subredditId sr id
   * @returns `{ status: 'success' }`
   */
  async joinSubreddit(userId: Types.ObjectId, subredditId: Types.ObjectId) {
    const subredditExist = await this.subredditExist(subredditId);

    if (!subredditExist) {
      throw new BadRequestException(
        `there is no subreddit with id ${subredditId}`,
      );
    }

    const queryObject = {
      subredditId,
      userId,
    };

    await Promise.all([
      await this.userSubredditModel.create(queryObject),
      await this.userSubredditLeftModel.deleteOne(queryObject),
    ]);

    await this.subredditModel.updateOne(
      { _id: subredditId },
      { $inc: { users: 1 } },
    );

    return { status: 'success' };
  }

  /**
   * leave a sr
   * @param userId user's id
   * @param subredditId sr' id
   * @returns `{ status: 'success' }`
   */
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

    await Promise.all([
      await this.userSubredditLeftModel.create({
        subredditId,
        userId,
      }),

      await this.subredditModel.updateOne(
        { _id: subredditId },
        { $inc: { users: -1 } },
      ),
    ]);

    return { status: 'success' };
  }

  /**
   * gets common stages
   * @param userId user's id
   * @param page page number
   * @param limit limit
   * @returns query
   */
  private getSrCommonStages(userId, page, limit) {
    return [
      {
        $project: {
          ...subredditSelectedFields,
          srId: '$_id',
        },
      },
      srGetUsersRelated(userId),
      srProjectionNumOfUsersAndIfIamJoined(userId),
      ...srPagination(page, limit),
    ];
  }

  /**
   * search SRs
   * @param searchPhrase search words
   * @param username user's username
   * @param userId user's id
   * @param page page number
   * @param numberOfData limit
   * @returns all SRs relating to search
   */
  async getSubredditStartsWithChar(
    searchPhrase: string,
    username,
    userId,
    page = 1,
    numberOfData = 50,
  ) {
    const res = await this.subredditModel.aggregate([
      {
        $match: {
          $and: [
            { name: new RegExp(`^${searchPhrase}`, 'i') },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { 'bannedUsers.username': { $ne: username } },
          ],
        },
      },
      ...this.getSrCommonStages(userId, page, numberOfData),
    ]);

    return res.map((v) => ({ ...v, joined: v.joined?.length > 0 }));
  }

  /**
   * search SRs
   * @param searchPhrase search words
   * @param username user's username
   * @param userId user's id
   * @param page page number
   * @param numberOfData limit
   * @returns all SRs relating to search
   */
  async getSearchSubredditAggregation(
    searchPhrase: string,
    username,
    userId,
    pageNumber = 1,
    numberOfData = 50,
  ) {
    const res = await this.subredditModel.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { name: { $regex: searchPhrase, $options: 'i' } },
                { description: { $regex: searchPhrase, $options: 'i' } },
              ],
            },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { 'bannedUsers.username': { $ne: username } },
          ],
        },
      },
      ...this.getSrCommonStages(userId, pageNumber, numberOfData),
    ]);

    return res.map((v) => ({ ...v, joined: v.joined?.length > 0 }));
  }

  /**
   * search flairs
   * @param searchPhrase search words
   * @param subreddit sr name
   * @param page page number
   * @param limit limit
   * @returns all flairs matching
   */
  getSearchFlairsAggregate(
    searchPhrase: string,
    subreddit: Types.ObjectId,
    page = 1,
    limit = 50,
  ) {
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
        $skip: ((Number(page) || 1) - 1) * Number(limit),
      },
      {
        $limit: Number(limit),
      },
    ]);
  }

  /**
   * adds a sr to category
   * @param subreddit sr id
   * @param username user's username
   * @param categories the category
   * @returns `{ status: 'success' }`
   */
  async addSubredditCategories(
    subreddit: Types.ObjectId,
    username: string,
    categories: string[],
  ) {
    this.checkUserNotNull(username);
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

  /**
   * gets all sr in a category
   * @param category the category
   * @param page page number
   * @param limit limit
   * @param userId user's id
   * @param username user's username
   * @returns `{ status: 'success' }`
   */
  async getSubredditsWithCategory(
    category: string,
    page = 1,
    limit = 50,
    userId?,
    username?,
  ) {
    const res = await this.subredditModel.aggregate([
      {
        $match: {
          $and: [{ categories: category }, { bannedUsers: { $ne: username } }],
        },
      },
      ...this.getSrCommonStages(userId, page, limit),
    ]);

    return res.map((v) => ({ ...v, joined: v.joined?.length > 0 }));
  }

  /**
   * create a response
   * @param modifiedCount  modified count
   * @param message the message
   * @returns `{ status: 'success' }`
   */
  private modifiedCountResponse(modifiedCount, message?) {
    if (modifiedCount === 0) {
      throw new BadRequestException(message);
    }

    return {
      status: 'success',
    };
  }

  /**
   * adds a new moderator to sr
   * @param moderatorUsername moderator username
   * @param newModuratorUsername the moderator to be added as moderated
   * @param subreddit
   * @returns `{ status: 'success' }`
   */
  async addNewModerator(
    moderatorUsername: string,
    newModuratorUsername: string,
    subreddit: Types.ObjectId,
  ) {
    if (
      !(await this.userService.userExist({ username: newModuratorUsername }))
    ) {
      throw new BadRequestException("user doesn't exist");
    }

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

  /**
   * gets subreddit match stage
   * @param matchStage the stage
   * @param page page
   * @param limit limit
   * @param userId user's id
   */
  async getSubredditsWithMatch(matchStage, page = 1, limit = 50, userId?) {
    this.checkUserNotNull(userId);
    const res = await this.subredditModel.aggregate([
      { $match: matchStage },
      ...this.getSrCommonStages(userId, page, limit),
    ]);

    return res.map((v) => ({ ...v, joined: v.joined?.length > 0 }));
  }

  /**
   * checks if user is a moderator in a sr
   * @param srName sr name
   * @param username user's username
   */
  async checkIfModerator(srName: string, username: string) {
    const moderator = await this.subredditModel.exists({
      moderators: username,
      name: srName,
    });

    if (!moderator) {
      throw new UnauthorizedException(
        'you are not an moderator or wrong subreddit id',
      );
    }
  }

  /**
   * get all unmoderated things
   * @param srName sr name
   * @param modUsername mod username
   * @param pagination pagination params
   * @param type thing type
   * @returns all things
   */
  async getUnModeratedThings(
    srName: string,
    modUsername: string,
    pagination: PaginationParamsDto,
    type: string | undefined,
  ) {
    await this.checkIfModerator(srName, modUsername);

    return this.postCommentService.getUnModeratedThingsForSubreddit(
      srName,
      pagination,
      type,
    );
  }

  /**
   * get spammed things
   * @param srName sr name
   * @param modUsername moderate username
   * @param pagination pagination params
   * @param type thing type
   */
  async getSpammedThings(
    srName: string,
    modUsername: string,
    pagination: PaginationParamsDto,
    type: string | undefined,
  ) {
    await this.checkIfModerator(srName, modUsername);

    return this.postCommentService.getSpammedThingsForSubreddit(
      srName,
      pagination,
      type,
    );
  }

  /**
   * gets edited things
   * @param srName sr name
   * @param modUsername moderate username
   * @param pagination pagination params
   * @param type thing type
   */
  async getEditedThings(
    srName: string,
    modUsername: string,
    pagination: PaginationParamsDto,
    type: string | undefined,
  ) {
    await this.checkIfModerator(srName, modUsername);

    return this.postCommentService.getEditedThingsForSubreddit(
      srName,
      pagination,
      type,
    );
  }

  /**
   * all user's joined subreddit
   * @param userId user's id
   */
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

  /**
   * gets subreddit moderator
   * @param subreddit sr id
   */
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

  /**
   * check if user is joined
   * @param userId user's id
   * @param subredditId subreddit id
   * @returns boolean
   */
  async isJoined(userId: Types.ObjectId, subredditId: Types.ObjectId) {
    const res = await this.userSubredditModel.findOne({
      userId,
      subredditId,
    });

    return Boolean(res);
  }

  /**
   * check if user is moderator
   * @param username user's username
   * @param subreddit subreddit id
   * @returns boolean
   */
  async isModerator(username: string, subreddit: Types.ObjectId) {
    this.checkUserNotNull(username);
    const res = await this.subredditModel.findOne({
      moderators: username,
      _id: subreddit,
    });

    return Boolean(res);
  }

  /**
   * add a rule
   * @param subreddit sr id
   * @param username username
   * @param ruleDto encapolates rules dto
   */
  async addRule(subreddit: Types.ObjectId, username: string, ruleDto: RuleDto) {
    ruleDto._id = new Types.ObjectId();
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

  /**
   * deletes a rule
   * @param subreddit sr id
   * @param ruleId rule id
   * @param username usr' username
   */
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

  /**
   * updates a rule
   * @param subreddit sr id
   * @param ruleId rule id
   * @param username user' username
   * @param ruleDto rule dto
   */
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

  /**
   * joins a sr
   * @param subreddit sr id
   * @param userId user id
   */
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

  /**
   * get list of users asking to join sr
   * @param subreddit sr id
   * @param moderatorUsername moderator id
   */
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

  /**
   * delete a user from waiting list
   * @param subreddit sr id
   * @param moderatorUsername mod username
   * @param userId user id
   * @returns `{ status: 'success' }`
   */
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

  /**
   * accept sr join request
   * @param subredditId sr id
   * @param moderatorUsername moderator username
   * @param userId user id
   * @returns `{ status: 'success' }`
   */
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

  /**
   * gets a user from a list of users
   * @param subredditId sr id
   * @param userId user id
   * @param fieldName field name
   * @returns
   */
  async getUsersFromListUserDate(
    subredditId: Types.ObjectId,
    userId: string,
    fieldName: string,
  ) {
    const prjectField = {};
    prjectField[fieldName] = 1;

    // We don't have to check if the request is bad
    // eslint-disable-next-line sonarjs/prefer-immediate-return
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
          ...prjectField,
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

    return res.map((v) => ({ ...v[fieldName], ...v.user[0] }));
  }

  /**
   * list of updating user
   * @param list the lost to be quered
   * @param updateDto the data encapsolated
   * @param username user's usernme
   */
  private listUserUpdating(list, updateDto, username) {
    return list.map((v) => {
      if (v.username === username) {
        // eslint-disable-next-line unicorn/no-array-for-each
        Object.keys(updateDto).forEach((key) => {
          if (key === 'username') {
            throw new BadRequestException();
          }

          v[key] = updateDto[key];
        });
      }

      return v;
    });
  }

  /**
   * updates a list
   * @param subredditId  sr id
   * @param moderatorUsername moderator username
   * @param username user's username
   * @param fieldName field name
   * @param updateDto encapsulates the data
   * @returns modified count
   */
  async updateListUserDate(
    subredditId: Types.ObjectId,
    moderatorUsername: string,
    username: string,
    fieldName: string,
    updateDto,
  ) {
    this.checkUserNotNull(moderatorUsername);

    const res = await this.subredditModel
      .findById(subredditId)
      .select(fieldName);

    if (!res) {
      throw new BadRequestException();
    }

    const list = this.listUserUpdating(res[fieldName], updateDto, username);

    const updateObject = {};
    updateObject[fieldName] = list;

    const res2 = await this.subredditModel.updateOne(
      {
        _id: subredditId,
        moderators: moderatorUsername,
      },
      updateObject,
    );

    return this.modifiedCountResponse(res2.modifiedCount);
  }

  /**
   * remove a user from list
   * @param subredditId sr id
   * @param moderatorUsername  mo username
   * @param username user name
   * @param fieldName field name
   * @returns modified count
   */
  async removeUserFromListUserDate(
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

  /**
   * checks if user is already processed
   * @param username user name
   * @param subredditId sr id
   * @param fieldName field name
   * @returns boolean
   */
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

  /**
   * adds a user to a date list
   * @param subredditId sr id
   * @param moderatorUsername mod username
   * @param dataSent the data
   * @param fieldName field name
   * @param extraStage the extra stage if applicable
   * @returns modified count
   */
  async addUserToListUserDate(
    subredditId: Types.ObjectId,
    moderatorUsername: string,
    dataSent,
    fieldName: string,
    extraStage = {},
  ) {
    const { username } = dataSent;

    if (!(await this.userService.userExist({ username }))) {
      throw new BadRequestException("user doesn't exist");
    }

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
      ...dataSent,
      date: new Date(),
    };

    const res = await this.subredditModel.updateOne(
      {
        $and: [
          { _id: subredditId },
          { moderators: moderatorUsername },
          extraStage,
        ],
      },
      {
        $push: properityObject,
      },
    );

    return this.modifiedCountResponse(res.modifiedCount);
  }

  /**
   * adds a sub topic to a sr
   * @param subredditId sr id
   * @param subTopics the sub topic
   * @param username the user' username
   * @returns modified count
   */
  async addSubTobics(
    subredditId: Types.ObjectId,
    subTopics: string[],
    username: string,
  ) {
    const res = await this.subredditModel.findOneAndUpdate(
      {
        _id: subredditId,
        moderators: username,
        $or: [{ activeTopic: { $in: subTopics } }, { activeTopic: null }],
      },
      { subTopics },
      { new: false },
    );

    if (res?.activeTopic) {
      await this.subredditModel.updateOne(
        { _id: subredditId },
        { $pull: { subTopics: res.activeTopic } },
      );
    }

    return this.modifiedCountResponse(res ?? 0);
  }

  /**
   * adds a n active topic
   * @param subredditId sr id
   * @param activeTopic the active topic
   * @param username user's username
   * @returns modified count
   */
  async addActiveTobic(
    subredditId: Types.ObjectId,
    activeTopic: string,
    username: string,
  ) {
    const res = await this.subredditModel
      .findOneAndUpdate(
        {
          _id: subredditId,
          subTopics: activeTopic,
          moderators: username,
        },
        {
          activeTopic,
          $pull: { subTopics: activeTopic },
        },
        { new: false },
      )
      .select('activeTopic subTopics');

    if (res?.activeTopic) {
      await this.subredditModel.updateOne(
        { _id: subredditId },
        { $push: { subTopics: res.activeTopic } },
      );
    }

    return this.modifiedCountResponse(res ?? 0);
  }

  /**
   * gets a sr stats
   * @param model the moongoose model
   * @param srName the sr name
   * @param fieldName field name
   * @param format the format
   * @param fromDate the from date
   * @param toDate the end date
   * @returns the stats
   */
  private getSubredditStatsGeneral = async (
    model,
    srName,
    fieldName: string,
    format: string,
    fromDate: Date,
    toDate: Date,
  ) => {
    const groupObject = {
      _id: { $dateToString: { format, date: '$date' } },
    };
    groupObject[fieldName] = {
      $sum: 1,
    };

    const sr = await this.subredditModel
      .findOne({ name: srName })
      .select('_id');

    return model.aggregate([
      {
        $match: {
          $and: [
            {
              subredditId: sr?._id,
              date: {
                $gt: fromDate,
                $lt: toDate,
              },
            },
          ],
        },
      },
      {
        $group: groupObject,
      },
    ]);
  };

  /**
   * gets the stat for the week
   * @param srName sr name
   * @returns the stats
   */
  async getSrStatitisticsWeek(srName: string) {
    const d = new Date();
    const fromDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 6);
    const toDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

    const res = await Promise.all([
      this.getSubredditStatsGeneral(
        this.userSubredditModel,
        srName,
        'joined',
        '%Y-%m-%d',
        fromDate,
        toDate,
      ),
      this.getSubredditStatsGeneral(
        this.userSubredditLeftModel,
        srName,
        'left',
        '%Y-%m-%d',
        fromDate,
        toDate,
      ),
    ]);

    return res[0].map((v, i) => ({
      date: v._id,
      joined: v.joined ?? 0,
      left: res[1][i]?.left ?? 0,
    }));
  }

  /**
   * gets sr stats for the year
   * @param srName sr name
   * @returns the stats
   */
  async getSrStatitisticsYear(srName: string) {
    const d = new Date();
    const fromDate = new Date(d.getFullYear(), 0);
    const toDate = new Date(d.getFullYear() + 1, 0);

    const res = await Promise.all([
      this.getSubredditStatsGeneral(
        this.userSubredditModel,
        srName,
        'joined',
        '%Y-%m',
        fromDate,
        toDate,
      ),
      this.getSubredditStatsGeneral(
        this.userSubredditLeftModel,
        srName,
        'left',
        '%Y-%m',
        fromDate,
        toDate,
      ),
    ]);

    return res[0].map((v, i) => ({
      date: v._id,
      joined: v.joined ?? 0,
      left: res[1][i]?.left ?? 0,
    }));
  }
}

import { randomInt } from 'node:crypto';

import {
  BadRequestException,
  Global,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import type { Response } from 'express';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import { BlockService } from '../block/block.service';
import { FollowService } from '../follow/follow.service';
import { PostCommentService } from '../post-comment/post-comment.service';
import { ThingFetch } from '../post-comment/post-comment.utils';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { ImagesHandlerService } from '../utils/imagesHandler/images-handler.service';
import { userSelectedFields } from '../utils/project-selected-fields';
import type {
  AvailableUsernameDto,
  CreateUserDto,
  FilterUserDto,
  UserAccountDto,
} from './dto';
import { PrefsDto } from './dto';
import type { User, UserDocument, UserWithId } from './user.schema';
@Global()
@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly followService: FollowService,
    private readonly blockService: BlockService,
    private readonly postCommentService: PostCommentService,
    private readonly imagesHandlerService: ImagesHandlerService,
    private readonly apiFeaturesService: ApiFeaturesService,
  ) {}

  getFriends() {
    return 'get user list of friends';
  }

  acceptFriendRequest() {
    return 'accept user friend request';
  }

  sendFriendRequest() {
    return 'send a friend request';
  }

  deleteFriendRequest() {
    return 'delete a friend request';
  }

  unFriend() {
    return 'delete a friend';
  }

  async searchPeopleAggregate(
    searchPhrase,
    userId,
    page = 1,
    numberOfData = 50,
  ) {
    const fetcher = new ThingFetch(userId);

    const res = await this.userModel.aggregate([
      {
        $match: {
          $and: [
            { username: new RegExp(`^${searchPhrase}`, 'i') },
            { showInSearch: { $ne: 0 } },
          ],
        },
      },
      {
        $project: {
          userId: '$_id',
          ...userSelectedFields,
        },
      },
      ...fetcher.filterBlocked(),
      {
        $unset: 'block',
      },
      {
        $lookup: {
          from: 'follows',
          as: 'followed',
          let: {
            userId: '$userId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$follower', userId] },
                    { $eq: ['$followed', '$$userId'] },
                  ],
                },
              },
            },
          ],
        },
      },
      ...fetcher.getPaginated(page, numberOfData),
    ]);

    return res.map((v) => ({ ...v, followed: v.followed.length > 0 }));
  }

  /**
   *
   * @param dto look at CreateUserDto
   * @returns return user created
   */
  createUser = async (dto: CreateUserDto): Promise<UserDocument> => {
    try {
      const hashPassword = await bcrypt.hash(
        dto.password,
        await bcrypt.genSalt(10),
      );
      const user: UserDocument = await this.userModel.create({
        ...dto,
        hashPassword,
      });

      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  };

  private async getOneUser(
    filter: FilterUserDto,
    selectPassword = false,
  ): Promise<UserDocument> {
    const user: UserDocument | null | undefined = await this.userModel
      .findOne(filter)
      .select(selectPassword ? '+hashPassword' : '');

    if (!user) {
      throw new NotFoundException(
        `there is no user with information ${JSON.stringify(filter)}`,
      );
    }

    return user;
  }

  /**
   * get a user with specific id
   * @param id id of the user
   * @returns the user
   */
  async getUserById(
    id: Types.ObjectId,
    selectPassword = false,
  ): Promise<UserDocument> {
    return this.getOneUser({ _id: id }, selectPassword);
  }

  async getUserByUsername(
    username: string,
    selectPassword = false,
  ): Promise<UserDocument> {
    return this.getOneUser({ username }, selectPassword);
  }

  private async createHashedPassword(password: string): Promise<string> {
    return bcrypt.hash(password, await bcrypt.genSalt(10));
  }

  async changePassword(id: Types.ObjectId, password: string): Promise<void> {
    const hashPassword = await this.createHashedPassword(password);
    const user: UserDocument | null = await this.userModel.findByIdAndUpdate(
      id,
      {
        hashPassword,
      },
    );

    if (!user) {
      throw new NotFoundException(`there is no user with id ${id.toString()}`);
    }
  }

  /**
   * returns a data of the user's about page
   * @param user1Id the user with token
   * @param user2Id the user to be requested
   * @returns UserAccountDto
   */
  async getUserInfo(
    user1Id: Types.ObjectId,
    user2Id: string,
  ): Promise<UserAccountDto> {
    // eslint-disable-next-line unicorn/no-await-expression-member
    const userId = (await this.getUserByUsername(user2Id))._id;
    const [isCurrentUserBlocked] = await this.userModel.aggregate([
      { $match: { username: user2Id } },
      {
        $lookup: {
          from: 'blocks',
          as: 'blocks',
          let: { id: '$_id' },

          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$blocks.blocked', user1Id] },
                    { $eq: ['$blocks.blocker', userId] },
                  ],
                },
              },
            },
          ],
        },
      },
    ]);

    if (
      isCurrentUserBlocked.blocks !== undefined &&
      isCurrentUserBlocked.blocks.length > 0
    ) {
      throw new UnauthorizedException('User has blocked you');
    }

    const [user]: any = await this.userModel.aggregate([
      { $match: { username: user2Id } },
      {
        $lookup: {
          from: 'blocks',
          as: 'blocks',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$blocker', user1Id],
                    },
                    { $eq: ['$blocked', userId] },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'follows',
          as: 'follows',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$follower', user1Id] },
                    { $eq: ['$followed', userId] },
                  ],
                },
              },
            },
          ],
        },
      },
    ]);
    const {
      _id,
      profilePhoto,
      coverPhoto,
      createdAt,
      username,
      about,
      displayName,
      socialLinks,
      nsfw,
    } = user;
    let isBlocked = false;

    // eslint-disable-next-line unicorn/consistent-destructuring
    if (user.blocks !== undefined && user.blocks.length > 0) {
      isBlocked = true;
    }

    let isFollowed = false;

    // eslint-disable-next-line unicorn/consistent-destructuring
    if (user.follows !== undefined && user.follows.length > 0) {
      isFollowed = true;
    }

    return {
      _id,
      profilePhoto,
      coverPhoto,
      username,
      createdAt,
      isBlocked,
      isFollowed,
      about,
      displayName,
      socialLinks,
      nsfw,
    };
  }

  async validPassword(
    userPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(userPassword, hashedPassword);
  }

  private randomPrefixes = [
    'player',
    'good',
    'success',
    'winner',
    'gamed',
    'attention',
    'successful',
  ];

  private generateRandomUsername(num: number): string {
    const date = Date.now().toString(36);
    const rand = randomInt(281_474_976_710_655).toString(36);
    const randomIndex =
      randomInt(1000 * (num + 1)) % this.randomPrefixes.length;
    const randomPrefix = this.randomPrefixes[randomIndex];

    return `${randomPrefix}-${date}${num}${rand}`;
  }

  /**
   * generate list of random usernames
   * @param length length of the list (may be less than it)
   * @returns list of random usernames
   */
  async generateRandomUsernames(length: number) {
    const randomList: string[] = Array.from({ length }).map((_, num) =>
      this.generateRandomUsername(num),
    );
    const usernameExists = await this.userModel
      .find({
        username: {
          $in: [...randomList],
        },
      })
      .select('username');

    return randomList.filter(
      (username) => !usernameExists.some((user) => user.username === username),
    );
  }

  async userExist(filter: FilterUserDto): Promise<boolean> {
    return (await this.userModel.count(filter)) > 0;
  }

  /**
   * A function to check if username is taken before or not
   * @param availableUsernameDto encapsulates the data of the request username
   * @param res the response that will be sent to the requester
   */
  checkAvailableUsername = async (
    availableUsernameDto: AvailableUsernameDto,
    res: Response,
  ) => {
    const user: UserDocument | null = await this.userModel.findOne({
      ...availableUsernameDto,
    });

    if (!user) {
      res.status(HttpStatus.CREATED).json({ status: true });
    } else {
      res.status(HttpStatus.UNAUTHORIZED).json({ status: false });
    }
  };

  /**
   * follow a user
   * @param follower id of the follower user
   * @param followed id of the followed user
   * @returns {status : 'success'}
   */
  async follow(
    follower: Types.ObjectId,
    followed: Types.ObjectId,
  ): Promise<any> {
    const isFollowed: boolean = await this.userExist({ _id: followed });

    if (!isFollowed) {
      throw new BadRequestException(
        `there is no user with id : ${followed.toString()}`,
      );
    }

    const isBlocked: boolean = await this.blockService.existBlockBetween(
      follower,
      followed,
    );

    if (isBlocked) {
      throw new UnauthorizedException(
        'there exist a block between you and this user',
      );
    }

    const followerDoc = await this.getUserById(follower);

    return this.followService.follow({
      follower,
      followed,
      followerUsername: followerDoc.username,
    });
  }

  /**
   * unfollow a user
   * @param follower id of the follower
   * @param followed id of the followed
   * @returns {status : 'success'}
   */
  async unfollow(
    follower: Types.ObjectId,
    followed: Types.ObjectId,
  ): Promise<any> {
    return this.followService.unfollow({ follower, followed });
  }

  /**
   * returns all user's preferences
   * @param _id user's Id
   * @returns a promise of PrefsDto
   */
  getUserPrefs = async (_id: Types.ObjectId): Promise<PrefsDto> => {
    const user: UserDocument = await this.getUserById(_id);

    return plainToInstance(PrefsDto, user);
  };

  /**
   * update some or all user's preferences
   * @param _id user's Id
   * @param prefsDto encapsulates requests data
   * @returns succuss status if Ok
   */
  updateUserPrefs = async (_id: Types.ObjectId, prefsDto: PrefsDto) => {
    await this.userModel.findByIdAndUpdate({ _id }, { ...prefsDto });

    return { status: 'success' };
  };

  /**
   * block a user
   * @param blocker id of the blocker user
   * @param blocked id of the blocked user
   * @returns {status : 'success'}
   */
  async block(blocker: Types.ObjectId, blocked: Types.ObjectId): Promise<any> {
    const isBlocked: boolean = await this.userExist({ _id: blocked });

    if (!isBlocked) {
      throw new BadRequestException(
        `there is no user with id : ${blocked.toString()}`,
      );
    }

    await this.followService.removeFollowBetween(blocker, blocked);

    return this.blockService.block({ blocker, blocked });
  }

  getBlockedUsers(blocker: Types.ObjectId) {
    return this.blockService.getBlockedUsers(blocker);
  }

  /**
   * unblock a user
   * @param blocker id of the follower
   * @param blocked id of the followed
   * @returns {status : 'success'}
   */
  async unblock(
    blocker: Types.ObjectId,
    blocked: Types.ObjectId,
  ): Promise<any> {
    return this.blockService.unblock({ blocker, blocked });
  }

  /**
   * make the regular user moderator
   * @param user_id id of the user to be moderator
   * @returns returns a user with edited authType
   */
  async allowUserToBeModerator(user_id: Types.ObjectId): Promise<any> {
    const user = await this.userModel.findById(user_id);

    if (!user) {
      throw new BadRequestException(`there is no user with id ${user_id}`);
    }

    if (user.authType === 'admin') {
      throw new BadRequestException(
        `you are not allowed to change the role of the admin through this endpoint`,
      );
    }

    user.authType = 'moderator';
    await user.save();

    return { status: 'success' };
  }

  /**
   * make a regular user admin
   * @param user_id id of the user to be an admin
   * @returns returns the user with new type
   */
  async makeAdmin(user_id: Types.ObjectId): Promise<any> {
    const user = await this.userModel
      .findByIdAndUpdate(
        user_id,
        {
          authType: 'admin',
        },
        { new: true },
      )
      .select('-hashPassword');

    if (!user) {
      throw new BadRequestException(`there is no user with id ${user_id}`);
    }

    return { status: 'success' };
  }

  async getUserIfExist(
    id: Types.ObjectId,
  ): Promise<UserWithId | null | undefined> {
    return this.userModel.findById(id);
  }

  async getUserTimeLine() {
    // await this.userModel.aggregate([
    //   {
    //     $lookup: {
    //       from: 'user-subreddit',
    //       localField: '_id',
    //       foreignField: 'user_id',
    //     },
    //   },
    // ]);
  }

  async deleteAccount(user: any) {
    await this.userModel
      .updateOne(
        { _id: user._id },
        {
          accountClosed: true,
        },
      )
      .select('');

    return { status: 'success' };
  }

  async savePost(user_id: Types.ObjectId, post_id: Types.ObjectId) {
    const data = await this.userModel
      .updateOne(
        { _id: user_id },
        {
          $addToSet: { savedPosts: post_id },
        },
      )
      .select('');

    if (data.modifiedCount === 0) {
      throw new BadRequestException('the post already saved');
    }

    return { status: 'success' };
  }

  getSavedPosts(userId: Types.ObjectId, paginationParams: PaginationParamsDto) {
    return this.postCommentService.getSavedPosts(userId, paginationParams);
  }

  uploadPhoto(id: Types.ObjectId, file: any, fieldName: string) {
    // return { id, file, fieldName };
    return this.imagesHandlerService.uploadPhoto(
      `${fieldName}s`,
      file,
      this.userModel,
      id,
      `${fieldName}`,
    );
  }

  async canRecieveMessages(
    userId: Types.ObjectId,
    senderName?: string,
  ): Promise<boolean> {
    return (
      (await this.userModel.count({
        _id: userId,
        $or: [{ acceptPms: 'everyone' }, { whitelisted: [senderName] }],
      })) > 0
    );
  }

  notifyPostComment = async (
    userId: Types.ObjectId,
    thingId: any,
    option: any,
  ) => {
    if (option === 1) {
      await this.userModel.updateOne(
        { _id: userId },
        { $addToSet: { dontNotifyIds: thingId } },
      );
    } else if (option === -1) {
      await this.userModel.updateOne(
        { _id: userId },
        { $pull: { dontNotifyIds: thingId } },
      );
    }

    return { status: 'success' };
  };
}

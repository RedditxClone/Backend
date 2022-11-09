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
import type { AvailableUsernameDto, CreateUserDto, FilterUserDto } from './dto';
import { PrefsDto } from './dto';
import type { User, UserDocument } from './user.schema';

@Global()
@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly followService: FollowService,
    private readonly blockService: BlockService,
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

  async validPassword(
    userPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(userPassword, hashedPassword);
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

    return this.followService.follow({ follower, followed });
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
}

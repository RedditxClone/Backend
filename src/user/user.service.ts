import { BadRequestException, Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/user.dto';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { FollowService } from '../follow/follow.service';
import { PrefsDto } from './dto';
import { throwGeneralException } from '../utils/throwException';
import { plainToClass } from 'class-transformer';

@Global()
@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly followService: FollowService,
  ) {}
  block() {
    return 'block a user';
  }

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
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  };
  /**
   *
   * @param id id of the user
   * @returns the user
   */
  getUserById = async (id: Types.ObjectId): Promise<UserDocument> => {
    try {
      const user: UserDocument = await this.userModel.findById(id);
      if (!user)
        throw new BadRequestException(`there is no user with id ${id}`);
      return user;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  };
  getUserByEmail = async (email: string): Promise<UserDocument> => {
    const user: UserDocument = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException(`no user with email ${email}`);
    return user;
  };
  async validPassword(
    userPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(userPassword, hashedPassword);
  }
  /**
   * follow a user
   * @param follower id of the follower user
   * @param followed id of the followed user
   * @returns {status : 'success'}
   */
  async follow(follower: Types.ObjectId, followed: Types.ObjectId) {
    const followedExist: boolean =
      (await this.userModel.count({
        _id: followed,
      })) > 0;
    if (!followedExist)
      throw new BadRequestException(
        `there is no user with id : ${followed.toString()}`,
      );
    return this.followService.follow({ follower, followed });
  }
  /**
   * unfollow a user
   * @param follower id of the follower
   * @param followed id of the followed
   * @returns {status : 'success'}
   */
  async unfollow(follower: Types.ObjectId, followed: Types.ObjectId) {
    return this.followService.unfollow({ follower, followed });
  }
  /**
   * returns all user's preferences
   * @param _id user's Id
   * @returns a promise of PrefsDto
   */
  getUserPrefs = async (_id: Types.ObjectId): Promise<PrefsDto> => {
    try {
      const user: UserDocument = await this.getUserById(_id);
      return plainToClass(PrefsDto, user);
    } catch (err) {
      throwGeneralException(err);
    }
  };
  /**
   * update some or all user's preferences
   * @param _id user's Id
   * @param prefsDto encapsulates requests data
   * @returns succuss status if Ok
   */
  updateUserPrefs = async (_id: Types.ObjectId, prefsDto: PrefsDto) => {
    try {
      await this.userModel.findByIdAndUpdate({ _id }, { ...prefsDto });
      return { status: 'success' };
    } catch (err) {
      throwGeneralException(err);
    }
  };
}

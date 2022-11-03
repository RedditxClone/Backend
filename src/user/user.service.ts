import {
  BadRequestException,
  Global,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/user.dto';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { FollowService } from '../follow/follow.service';
import { BlockService } from '../block/block.service';
import { throwGeneralException } from '../utils/throwException';

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
  async follow(
    follower: Types.ObjectId,
    followed: Types.ObjectId,
  ): Promise<any> {
    try {
      const followedExist: boolean =
        (await this.userModel.count({
          _id: followed,
        })) > 0;
      if (!followedExist)
        throw new BadRequestException(
          `there is no user with id : ${followed.toString()}`,
        );
      const blocked: boolean = await this.blockService.existBlockBetween(
        follower,
        followed,
      );
      if (blocked)
        throw new UnauthorizedException(
          'there exist a block between you and this user',
        );
      return this.followService.follow({ follower, followed });
    } catch (err) {
      throwGeneralException(err);
    }
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
   * block a user
   * @param blocker id of the blocker user
   * @param blocked id of the blocked user
   * @returns {status : 'success'}
   */
  async block(blocker: Types.ObjectId, blocked: Types.ObjectId): Promise<any> {
    const blockedExist: boolean =
      (await this.userModel.count({
        _id: blocked,
      })) > 0;
    if (!blockedExist)
      throw new BadRequestException(
        `there is no user with id : ${blocked.toString()}`,
      );
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
}

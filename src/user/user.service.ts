import {
  BadRequestException,
  Global,
  Injectable,
  NotFoundException,
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
import { FilterUserDto } from './dto/user-filter.dto';

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
  private async getOneUser(filter: FilterUserDto) {
    try {
      const user: UserDocument = await this.userModel.findOne(filter);
      if (!user)
        throw new NotFoundException(
          `there is no user with information ${JSON.stringify(filter)}`,
        );
      return user;
    } catch (err) {
      throwGeneralException(err);
    }
  }
  /**
   * get a user with specific id
   * @param id id of the user
   * @returns the user
   */
  async getUserById(id: Types.ObjectId): Promise<UserDocument> {
    return this.getOneUser({ _id: id });
  }
  async getUserByEmail(email: string): Promise<UserDocument> {
    return this.getOneUser({ email });
  }
  async getUserByUsername(username: string): Promise<UserDocument> {
    return this.getOneUser({ username });
  }
  async validPassword(
    userPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(userPassword, hashedPassword);
  }
  async userExist(filter: FilterUserDto): Promise<boolean> {
    return (await this.userModel.count(filter)) > 0;
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
      const followedExist: boolean = await this.userExist({ _id: followed });
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
    const blockedExist: boolean = await this.userExist({ _id: blocked });
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

  /**
   * make the regular user moderator
   * @param user_id id of the user to be moderator
   * @returns returns a user with edited authType
   */
  async allowUserToBeModerator(user_id: Types.ObjectId): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(user_id);
      if (!user)
        throw new BadRequestException(`there is no user with id ${user_id}`);
      if (user.authType === 'admin')
        throw new BadRequestException(
          `you are not allowed to change the role of the admin through this endpoint`,
        );
      user.authType = 'moderator';
      await user.save();
      delete user.hashPassword;
      return user;
    } catch (err) {
      throwGeneralException(err);
    }
  }
  /**
   * make a regular user admin
   * @param user_id id of the user to be an admin
   * @returns returns the user with new type
   */
  async makeAdmin(user_id: Types.ObjectId): Promise<UserDocument> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(
          user_id,
          {
            authType: 'admin',
          },
          { new: true },
        )
        .select('-hashPassword');
      if (!user)
        throw new BadRequestException(`there is no user with id ${user_id}`);
      return user;
    } catch (err) {
      throwGeneralException(err);
    }
  }
}

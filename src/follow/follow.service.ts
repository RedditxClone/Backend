import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';
import type { UserSimpleDto } from 'user/dto';
import type {
  PaginatedResponseDto,
  PaginationParamsDto,
} from 'utils/apiFeatures/dto';

import { NotificationService } from '../notification/notification.service';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { FollowDto } from './dto/follow.dto';
import type { Follow } from './follow.schema';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel('Follow') private readonly followModel: Model<Follow>,
    private readonly apiFeaturesService: ApiFeaturesService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   *  follow user
   * @param dto see Follow DTO
   * @returns {status : 'success'}
   */
  async follow(dto: FollowDto): Promise<any> {
    try {
      if (dto.followed.toString() === dto.follower.toString()) {
        throw new BadRequestException('you are not allowed to follow yourself');
      }

      await this.followModel.create(dto);
      //get follower
      await this.notificationService.notifyOnFollow(
        dto.followed,
        dto.follower,
        dto.follower,
        dto.followerUsername ?? '',
      );

      return { status: 'success' };
    } catch (error) {
      if (error?.message?.startsWith('E11000')) {
        error.message = `user with id : ${dto.follower.toString()} is already following user with id : ${dto.followed.toString()}`;
      }

      throw error;
    }
  }

  /**
   * unfollow user
   * @param dto see FollowDto
   * @returns {status : 'success'}
   */
  async unfollow(dto: FollowDto): Promise<any> {
    const { acknowledged, deletedCount } = await this.followModel.deleteOne(
      dto,
    );

    if (!acknowledged || deletedCount !== 1) {
      throw new BadRequestException(
        `user with id : ${dto.follower.toString()} is not following user with id : ${dto.followed.toString()}`,
      );
    }

    return { status: 'success' };
  }

  /**
   * force remove a follow (if the follow is not exist it doesn't do anything)
   * @param dto see FollowDto
   * @returns return true if the follow was exist else it returns false
   */
  async removeFollowBetween(
    user1: Types.ObjectId,
    user2: Types.ObjectId,
  ): Promise<boolean> {
    const followRes = await this.followModel.deleteMany({
      $or: [
        { follower: user1, followed: user2 },
        { follower: user2, followed: user1 },
      ],
    });

    return followRes.deletedCount === 1;
  }

  /**
   * get list of users the user is following
   * @param userId id of the requesting user
   * @param paginationParams parameters of pagination
   * @returns paginated response containing list of users
   */
  async getFollowingUsers(
    userId: Types.ObjectId,
    paginationParams: PaginationParamsDto,
  ): Promise<PaginatedResponseDto<UserSimpleDto>> {
    const aggregateQuery = this.followModel.aggregate([
      { $match: { follower: userId } },
      {
        $lookup: {
          from: 'users',
          as: 'user',
          localField: 'followed',
          foreignField: '_id',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: '$user._id',
          username: '$user.username',
          profilePhoto: '$user.profilePhoto',
        },
      },
    ]);

    return this.apiFeaturesService.getPaginatedResponseFromAggregate(
      aggregateQuery,
      paginationParams,
    );
  }

  /**
   * get list of users that are following this user
   * @param userId id of the requesting user
   * @param paginationParams parameters of pagination
   * @returns paginated response containing list of users
   */
  async getFollowedUsers(
    userId: Types.ObjectId,
    paginationParams: PaginationParamsDto,
  ): Promise<PaginatedResponseDto<UserSimpleDto>> {
    const aggregateQuery = this.followModel.aggregate([
      { $match: { followed: userId } },
      {
        $lookup: {
          from: 'users',
          as: 'user',
          localField: 'follower',
          foreignField: '_id',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: '$user._id',
          username: '$user.username',
          profilePhoto: '$user.profilePhoto',
        },
      },
    ]);

    return this.apiFeaturesService.getPaginatedResponseFromAggregate(
      aggregateQuery,
      paginationParams,
    );
  }
}

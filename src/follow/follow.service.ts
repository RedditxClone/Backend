import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import type { FollowDto } from './dto/follow.dto';
import type { Follow } from './follow.schema';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel('Follow') private readonly followModel: Model<Follow>,
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
}

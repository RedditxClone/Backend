import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { throwGeneralException } from '../utils/throwException';
import { FollowDto } from './dto/follow.dto';
import { Follow } from './follow.schema';

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
  async follow(dto: FollowDto) {
    try {
      console.log(dto);
      if (dto.followed.toString() == dto.follower.toString())
        throw new BadRequestException('you are not allowed to follow yourself');
      await this.followModel.create(dto);
      return { status: 'success' };
    } catch (err) {
      if (err?.message?.startsWith('E11000'))
        err.message = `user with id : ${dto.follower.toString()} is already following user with id : ${dto.followed.toString()}`;
      throwGeneralException(err);
    }
  }
  /**
   * unfollow user
   * @param dto see FollowDto
   * @returns {status : 'success'}
   */
  async unfollow(dto: FollowDto) {
    try {
      const { acknowledged, deletedCount } = await this.followModel.deleteOne(
        dto,
      );
      if (!acknowledged || deletedCount !== 1) {
        throw new BadRequestException(
          `user with id : ${dto.follower.toString()} is not following user with id : ${dto.followed.toString()}`,
        );
      }
      return { status: 'success' };
    } catch (err) {
      throwGeneralException(err);
    }
  }
}

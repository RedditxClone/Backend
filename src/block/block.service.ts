import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import type { Block } from './block.schema';
import type { BlockDto } from './dto/block.dto';
/**
 * A service for block module
 */
@Injectable()
export class BlockService {
  /**
   * class constructor
   * @param blockModel block model
   */
  constructor(
    @InjectModel('Block') private readonly blockModel: Model<Block>,
  ) {}

  /**
   *  block user
   * @param dto see block DTO
   * @returns {status : 'success'}
   */
  async block(dto: BlockDto): Promise<any> {
    try {
      if (dto.blocker.toString() === dto.blocked.toString()) {
        throw new BadRequestException('you are not allowed to block yourself');
      }

      await this.blockModel.create(dto);

      return { status: 'success' };
    } catch (error) {
      if (error?.message?.startsWith('E11000')) {
        error.message = `user with id : ${dto.blocker.toString()} is already blocking user with id : ${dto.blocked.toString()}`;
      }

      throw error;
    }
  }

  /**
   * unblock user
   * @param dto see blockDto
   * @returns {status : 'success'}
   */
  async unblock(dto: BlockDto): Promise<any> {
    const { acknowledged, deletedCount } = await this.blockModel.deleteOne(dto);

    if (!acknowledged || deletedCount !== 1) {
      throw new BadRequestException(
        `user with id : ${dto.blocker.toString()} is not blocking user with id : ${dto.blocked.toString()}`,
      );
    }

    return { status: 'success' };
  }

  /**
   * Check if a user has blocked another or vise versa
   * @param user1 MonogId of user1
   * @param user2 MonogId of user2
   * @returns if a block exists
   */
  async existBlockBetween(
    user1: Types.ObjectId,
    user2: Types.ObjectId,
  ): Promise<boolean> {
    return (
      (await this.blockModel.count({
        $or: [
          { blocker: user1, blocked: user2 },
          { blocker: user2, blocked: user1 },
        ],
      })) > 0
    );
  }

  /**
   * Get a list of users blocked
   * @param user_id MonogId of user
   * @returns List of users user1 has blocked
   */
  async getBlockedUsers(user_id: Types.ObjectId) {
    return this.blockModel
      .find({ blocker: user_id })
      .populate('blocked', 'username profilePhoto')
      .select('blocked');
  }

  /**
   * Get a list of ids of users blocked
   * @param user_id MonogId of user
   * @returns List of MongoIds of users user_id has blocked
   */
  async getBlockerUsersIds(user_id: Types.ObjectId) {
    return this.blockModel.find({ blocked: user_id }).select('-_id blocker');
  }
}

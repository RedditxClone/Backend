import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import type { Block } from './block.schema';
import type { BlockDto } from './dto/block.dto';

@Injectable()
export class BlockService {
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

  async getBlockedUsers(user_id: Types.ObjectId) {
    return this.blockModel
      .find({ blocker: user_id })
      .populate('blocked', 'username profilePhoto');
  }
}

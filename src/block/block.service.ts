import { BadRequestException, Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { throwGeneralException } from '../utils/throwException';
import { BlockDto } from './dto/block.dto';
import { Block } from './block.schema';

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
      console.log(dto);
      if (dto.blocker.toString() == dto.blocked.toString())
        throw new BadRequestException('you are not allowed to block yourself');
      await this.blockModel.create(dto);
      return { status: 'success' };
    } catch (err) {
      if (err?.message?.startsWith('E11000'))
        err.message = `user with id : ${dto.blocker.toString()} is already blocking user with id : ${dto.blocked.toString()}`;
      throwGeneralException(err);
    }
  }
  /**
   * unblock user
   * @param dto see blockDto
   * @returns {status : 'success'}
   */
  async unblock(dto: BlockDto): Promise<any> {
    try {
      const { acknowledged, deletedCount } = await this.blockModel.deleteOne(
        dto,
      );
      if (!acknowledged || deletedCount !== 1) {
        throw new BadRequestException(
          `user with id : ${dto.blocker.toString()} is not blocking user with id : ${dto.blocked.toString()}`,
        );
      }
      return { status: 'success' };
    } catch (err) {
      throwGeneralException(err);
    }
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
}

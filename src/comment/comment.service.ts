import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import type { Comment } from './comment.schema';
import type { CreateCommentDto, UpdateCommentDto } from './dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
  ) {}

  /**
   * Create a Comment in a subreddit.
   * @param userId user's id whom is creating the Comment
   * @param createCommentDto encapsulating the create Comment data
   * @returns a promise of the Comment created
   * @throws BadRequestException when falling to create a Comment
   */
  create = async (
    userId: Types.ObjectId,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment & { _id: Types.ObjectId }> => {
    const parentId = new Types.ObjectId(createCommentDto.parentId);
    const postId = new Types.ObjectId(createCommentDto.postId);
    const comment: Comment & { _id: Types.ObjectId } =
      await this.commentModel.create({
        userId,
        ...createCommentDto,
        postId,
        parentId,
      });

    return comment;
  };

  findAll() {
    return `This action returns all comment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, _updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}

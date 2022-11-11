import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import type { CreatePostCommentDto } from './dto/create-post-comment.dto';
import type { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import type { PostComment } from './post-comment.schema';

@Injectable()
export class PostCommentService {
  constructor(
    @InjectModel('PostComment')
    private readonly postComModule: Model<PostComment>,
  ) {}

  create(_createPostCommentDto: CreatePostCommentDto) {
    return 'This action adds a new postComment';
  }

  findAll() {
    return `This action returns all postComment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postComment`;
  }

  async update(id: Types.ObjectId, dto: UpdatePostCommentDto) {
    const updatedThing = await this.postComModule.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updatedThing) {
      throw new NotFoundException(`id : ${id} not found`);
    }

    return { status: 'success' };
  }

  remove(id: number) {
    return `This action removes a #${id} postComment`;
  }
}

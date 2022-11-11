import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import type { CreatePostDto, UpdatePostDto } from './dto';
import type { Post } from './post.schema';

@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private readonly postModel: Model<Post>) {}

  /**
   * Create a post in a subreddit.
   * @param userId user's id whom is creating the post
   * @param createPostDto encapsulating the create post data
   * @returns a promise of the post created
   * @throws BadRequestException when falling to create a post
   */
  create = async (
    userId: Types.ObjectId,
    createPostDto: CreatePostDto,
  ): Promise<Post> => {
    try {
      const subredditId = new Types.ObjectId(createPostDto.subredditId);
      const post: Post = await this.postModel.create({
        userId,
        ...createPostDto,
        subredditId,
      });

      return post;
    } catch (error) {
      throw new BadRequestException(error);
    }
  };

  findAll() {
    return `This action returns all post`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, _updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}

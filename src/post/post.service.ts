import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import type { CreatePostDto, UpdatePostDto } from './dto';
import { UploadMediaDto } from './dto';
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
    //TODO:
    // add this validation to dto and it will transfer it and add validation
    // make sure that there exist a subreddit with this id
    const subredditId = new Types.ObjectId(createPostDto.subredditId);
    const post: Post = await this.postModel.create({
      userId,
      ...createPostDto,
      subredditId,
    });

    return post;
  };

  /**
   * Uploads users media on a post
   * @param files the files the user uploaded
   * @returns a list of uploaded images Ids for referencing.
   */
  uploadMedia = (files: Express.Multer.File[]): UploadMediaDto => {
    const res: UploadMediaDto = new UploadMediaDto();
    res.status = 'success';

    res.mediaIds = files.map((file: Express.Multer.File) => file.filename);

    return res;
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

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ThingFetch } from '../post-comment/post-comment.utils';
import type { CreatePostDto, UpdatePostDto } from './dto';
import { UploadMediaDto } from './dto';
import type { Hide } from './hide.schema';
import type { Post } from './post.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('Hide') private readonly hideModel: Model<Hide>,
  ) {}

  async hide(postId: Types.ObjectId, userId: Types.ObjectId) {
    await this.hideModel.create({
      postId,
      userId,
    });

    return { status: 'success' };
  }

  async unhide(postId: Types.ObjectId, userId: Types.ObjectId) {
    await this.hideModel.deleteOne({
      postId,
      userId,
    });

    return { status: 'success' };
  }

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
  ): Promise<Post & { _id: Types.ObjectId }> => {
    //TODO:
    // add this validation to dto and it will transfer it and add validation
    // make sure that there exist a subreddit with this id
    const subredditId = new Types.ObjectId(createPostDto.subredditId);
    const post: Post & { _id: Types.ObjectId } = await this.postModel.create({
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

  private getRandomTimeLine(
    page: number | undefined,
    limit: number | undefined,
  ) {
    const fetcher = new ThingFetch(undefined);

    return this.postModel.aggregate([
      ...fetcher.prepare(),
      // return random sample
      { $sample: { size: Number(limit || 10) } },
      ...fetcher.SRInfo(),
      ...fetcher.userInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  private async getUserTimeLine(
    userId: Types.ObjectId,
    page: number | undefined,
    limit: number | undefined,
  ) {
    const fetcher = new ThingFetch(userId);

    return this.postModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.filterOfMySRs(),
      ...fetcher.filterHidden(),
      ...fetcher.filterBlocked(),
      ...fetcher.getPaginated(page, limit),
      ...fetcher.SRInfo(),
      ...fetcher.userInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async getTimeLine(
    userId: Types.ObjectId | undefined,
    page: number | undefined,
    limit: number | undefined,
  ) {
    if (!userId) {
      return this.getRandomTimeLine(page, limit);
    }

    return this.getUserTimeLine(userId, page, limit);
  }

  async getPostsOfUser(
    userId: Types.ObjectId,
    page: number | undefined,
    limit: number | undefined,
  ) {
    const fetcher = new ThingFetch(userId);

    return this.postModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.matchForSpecificUser(),
      ...fetcher.getPaginated(page, limit),
      ...fetcher.SRInfo(),
      ...fetcher.userInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);
  }
}

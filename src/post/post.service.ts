import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { PostCommentService } from '../post-comment/post-comment.service';
import { ThingFetch } from '../post-comment/post-comment.utils';
import type { PaginationParamsDto } from '../utils/apiFeatures/dto';
import type { CreatePostDto, UpdatePostDto } from './dto';
import { UploadMediaDto } from './dto';
import type { Hide } from './hide.schema';
import type { Post } from './post.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('Hide') private readonly hideModel: Model<Hide>,
    private readonly postCommentService: PostCommentService,
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

  /**
   * Uploads users media on a post
   * @param files the files the user uploaded
   * @returns a list of uploaded images Ids for referencing.
   */
  async uploadPostMedia(
    files: Express.Multer.File[],
    postId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    if (files.length === 0) {
      throw new BadRequestException('no media uploaded');
    }

    const media = files.map((file: Express.Multer.File) => file.filename);
    const data = await this.postModel.updateOne(
      { _id: postId, userId },
      {
        $push: { images: { $each: media } },
      },
    );

    if (data.modifiedCount === 0) {
      throw new NotFoundException(
        `you are not an owner of the post with id ${postId}`,
      );
    }

    return {
      status: 'success',
      images: media.map((name) => `assets/post-media/${name}`),
    };
  }

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

  private getRandomTimeLine(pagination: PaginationParamsDto) {
    const fetcher = new ThingFetch(undefined);
    const { limit } = pagination;

    return this.postModel.aggregate([
      ...fetcher.prepare(),
      // return random sample
      { $sample: { size: Number(limit || 10) } },
      ...fetcher.SRInfo(),
      ...fetcher.userInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async getPost(postId: Types.ObjectId, userId: Types.ObjectId) {
    const fetcher = new ThingFetch(userId);

    const post = await this.postModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.onlyOnePost(postId),
      ...fetcher.filterBlocked(),
      ...fetcher.filterHidden(),
      ...fetcher.userInfo(),
      ...fetcher.SRInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);

    if (post.length === 0) {
      throw new BadRequestException(`there is no post with id ${postId}`);
    }

    return post[0];
  }

  private async getUserTimeLine(
    userId: Types.ObjectId,
    pagination: PaginationParamsDto,
  ) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.filterOfMySRs(),
      ...fetcher.filterHidden(),
      ...fetcher.filterBlocked(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.SRInfo(),
      ...fetcher.userInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async getTimeLine(
    userId: Types.ObjectId | undefined,
    pagination: PaginationParamsDto,
  ) {
    if (!userId) {
      return this.getRandomTimeLine(pagination);
    }

    return this.getUserTimeLine(userId, pagination);
  }

  async getPostsOfUser(
    userId: Types.ObjectId,
    pagination: PaginationParamsDto,
  ) {
    const fetcher = new ThingFetch(userId);
    const { limit, sort, page } = pagination;

    return this.postModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.matchForSpecificUser(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.SRInfo(),
      ...fetcher.userInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async approve(modUsername: string, thingId: Types.ObjectId) {
    const [post] = await this.postCommentService.getThingIModerate(
      modUsername,
      thingId,
    );

    if (!post) {
      throw new NotFoundException(
        'either wrong id or you are not a moderator of the subreddit',
      );
    }

    if (post.approvedBy !== null) {
      throw new BadRequestException('post is already approved');
    }

    await this.postModel.findByIdAndUpdate(thingId, {
      approvedBy: modUsername,
      approvedAt: Date.now(),
    });

    return { status: 'success' };
  }

  async getHiddenPosts(
    userId: Types.ObjectId,
    pagination: PaginationParamsDto,
  ) {
    const fetcher = new ThingFetch(userId);
    const { page, limit, sort } = pagination;

    return this.postModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.getHidden(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.SRInfo(),
      ...fetcher.userInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async discover(
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
      ...fetcher.SRInfo(),
      {
        $unwind: {
          path: '$images',
        },
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.getDiscoverProject(),
    ]);
  }
}

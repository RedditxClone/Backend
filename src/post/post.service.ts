import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { Subreddit } from 'subreddit/subreddit.schema';

import { PostCommentService } from '../post-comment/post-comment.service';
import { ThingFetch } from '../post-comment/post-comment.utils';
import type { SubredditUser } from '../subreddit/subreddit-user.schema';
import type { UserUniqueKeys } from '../user/dto/user-unique-keys.dto';
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
    @InjectModel('UserSubreddit')
    private readonly subredditUserModel: Model<SubredditUser>,
    @InjectModel('Subreddit') private readonly subredditModel: Model<Subreddit>,
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

  async checkIfTheUserJoinedSR(
    userInfo: UserUniqueKeys,
    subredditId: Types.ObjectId,
  ) {
    const userJoined = await this.subredditUserModel.exists({
      userId: userInfo._id,
      subredditId,
    });

    if (!userJoined) {
      throw new NotFoundException("you haven't joined such a subreddit");
    }
  }

  async checkIfTheUserCanDoActionInsideSR(
    userInfo: UserUniqueKeys,
    subredditId: Types.ObjectId,
  ) {
    const username = userInfo.username || '';
    const sr = await this.subredditModel.findById(subredditId);
    const bannedUsers = sr?.bannedUsers.map((user) => user.username);
    const mutedUsers = sr?.mutedUsers.map((user) => user.username);

    if (bannedUsers?.includes(username) || mutedUsers?.includes(username)) {
      throw new BadRequestException(
        'banned and muted users cannot do this action',
      );
    }
  }

  async checkIfTheUserCanCreatePost(
    userInfo: UserUniqueKeys,
    subredditId: Types.ObjectId,
  ) {
    await this.checkIfTheUserJoinedSR(userInfo, subredditId);
    await this.checkIfTheUserCanDoActionInsideSR(userInfo, subredditId);
  }

  /**
   * Create a post in a subreddit.
   * @param userId user's id whom is creating the post
   * @param createPostDto encapsulating the create post data
   * @returns a promise of the post created
   * @throws BadRequestException when falling to create a post
   */
  create = async (
    userInfo: UserUniqueKeys,
    createPostDto: CreatePostDto,
  ): Promise<Post & { _id: Types.ObjectId }> => {
    const subredditId = new Types.ObjectId(createPostDto.subredditId);
    await this.checkIfTheUserCanCreatePost(userInfo, subredditId);
    const post: Post & { _id: Types.ObjectId } = await this.postModel.create({
      userId: userInfo._id,
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
    files: Express.Multer.File[] | undefined,
    postId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    if (!files || files.length === 0) {
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
      images: media.map((name) => `/assets/post-media/${name}`),
    };
  }

  findAll() {
    return `This action returns all post`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  async update(id: Types.ObjectId, dto: UpdatePostDto, userId: Types.ObjectId) {
    const thing: any = await this.postModel
      .findById(id)
      .populate('subredditId', 'flairList');

    if (!thing) {
      throw new BadRequestException(`id : ${id} not found `);
    }

    this.postCommentService.checkIfTheOwner(userId, thing.userId);

    this.postCommentService.checkIfValidFlairId(
      dto.flair,
      thing.subredditId.flairList,
    );

    const updatedThing = await this.postModel.findByIdAndUpdate(id, {
      ...dto,
      editedAt: Date.now(),
      editCheckedBy: null,
    });

    if (!updatedThing) {
      throw new NotFoundException(`id : ${id} not found`);
    }

    return { status: 'success' };
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
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.filterBannedUsers(),
      ...fetcher.userInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);

    if (post.length === 0) {
      throw new BadRequestException(`there is no post with id ${postId}`);
    }

    return post[0];
  }

  private async getUserTimeLine(
    userInfo: UserUniqueKeys,
    pagination: PaginationParamsDto,
  ) {
    const fetcher = new ThingFetch(userInfo._id);
    const { limit, page, sort } = pagination;

    const posts = await this.postModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.matchAllRelatedPosts(),
      ...fetcher.filterUnApproved(),
      ...fetcher.filterHidden(),
      ...fetcher.filterBlocked(),
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.filterBannedUsers(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.userInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);

    if (posts.length >= limit) {
      return posts;
    }

    const otherRandomPosts = await this.getRandomTimeLine({
      limit: limit - posts.length,
      page,
      sort,
    });

    return [...posts, ...otherRandomPosts];
  }

  async getTimeLine(
    userInfo: UserUniqueKeys | undefined,
    pagination: PaginationParamsDto,
  ) {
    if (!userInfo) {
      return this.getRandomTimeLine(pagination);
    }

    return this.getUserTimeLine(userInfo, pagination);
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
      ...fetcher.SRInfo(),
      ...fetcher.getMe(),
      ...fetcher.filterBannedUsers(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.userInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async addToComments(
    postId: Types.ObjectId,
    subredditId: Types.ObjectId,
    num: number,
  ): Promise<boolean> {
    const dataUpdated = await this.postModel.updateOne(
      { _id: postId, subredditId },
      {
        $inc: { commentCount: num },
      },
    );

    return dataUpdated.matchedCount > 0;
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
      spammedAt: null,
      spammedBy: null,
      removedBy: null,
      removedAt: null,
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
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.filterBannedUsers(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.userInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async getPopularPosts(
    userId: Types.ObjectId,
    pagination: PaginationParamsDto,
  ) {
    const fetcher = new ThingFetch(userId);
    const { page, limit, sort } = pagination;

    return this.postModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.filterBlocked(),
      ...fetcher.filterHidden(),
      ...fetcher.SRInfo(),
      ...fetcher.getMe(),
      ...fetcher.filterBannedUsers(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
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

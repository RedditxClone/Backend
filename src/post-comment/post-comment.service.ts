import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import { NotificationService } from '../notification/notification.service';
import type { Flair, Subreddit } from '../subreddit/subreddit.schema';
import type { PaginationParamsDto } from '../utils/apiFeatures/dto';
import {
  postSelectedFileds,
  subredditSelectedFields,
  userSelectedFields,
} from '../utils/project-selected-fields';
import type { Vote } from '../vote/vote.schema';
import type { CreatePostCommentDto } from './dto/create-post-comment.dto';
import type { FilterPostCommentDto } from './dto/filter-post-comment.dto';
import type { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import type { PostComment } from './post-comment.schema';
import { ThingFetch } from './post-comment.utils';
@Injectable()
export class PostCommentService {
  constructor(
    @InjectModel('PostComment')
    private readonly postCommentModel: Model<PostComment>,
    @InjectModel('Vote') private readonly voteModel: Model<Vote>,
    private readonly notificationService: NotificationService,
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

  checkIfTheOwner(
    userId: Types.ObjectId,
    postUserId: Types.ObjectId | undefined,
  ): void | never {
    if (userId.toString() === postUserId?.toString()) {
      return;
    }

    throw new UnauthorizedException('only the owner can do this operation');
  }

  checkIfValidFlairId(
    flairId: Types.ObjectId | undefined,
    flairs: Flair[] | undefined | null,
  ): void | never {
    if (!flairId) {
      return;
    }

    const validFlairId = flairs?.find(
      (flair) => flair._id.toString() === flairId.toString(),
    );

    if (validFlairId) {
      return;
    }

    throw new BadRequestException('flair is not included in post subreddit');
  }

  /**
   * Retrieves a comment or a post from the data base.
   * @param id the id of the thing to be retrieved
   * @param type the thing type
   * @returns a comment or post
   */
  get = async (id: Types.ObjectId, type: string) => {
    const thing: PostComment | null = await this.postCommentModel.findById(id);

    if (!thing) {
      throw new NotFoundException(`id : ${id} not found`);
    }

    if (thing.type !== type) {
      throw new BadRequestException(
        `Requested a ${type} but the id belongs to ${thing.type}`,
      );
    }

    return thing;
  };

  /**
   * Gets a graph of comments/posts
   * @param filter the filter of the parent
   * @returns and array of things with an array of comments
   */
  getThings = async (
    filter: FilterPostCommentDto,
    pagination: PaginationParamsDto,
  ) => {
    const fetcher = new ThingFetch(undefined);
    const { sort, limit, page } = pagination;
    const thing: any[] = await this.postCommentModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'postcomments',
          as: 'children',
          localField: '_id',
          foreignField: 'parentId',
        },
      },
      {
        $unwind: {
          path: '$children',
        },
      },
      {
        $replaceRoot: {
          newRoot: '$children',
        },
      },
      ...fetcher.prepare(),
      ...fetcher.filterBlocked(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.userInfo(),
      ...fetcher.getIsFollowed(),
      ...fetcher.voteInfo(),
      ...fetcher.getCommentProject(),
      {
        $lookup: {
          from: 'postcomments',
          as: 'children',
          let: {
            childrenId: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$parentId', '$$childrenId'],
                },
              },
            },
            ...fetcher.prepare(),
            ...fetcher.userInfo(),
            ...fetcher.filterBlocked(),
            ...fetcher.getIsFollowed(),
            ...fetcher.voteInfo(),
            ...fetcher.getCommentProject(),
          ],
        },
      },
      {
        $lookup: {
          from: 'postcomments',
          as: 'secondLevel',
          let: {
            parentList: '$children._id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$parentId', '$$parentList'],
                },
              },
            },
            ...fetcher.prepare(),
            ...fetcher.userInfo(),
            ...fetcher.filterBlocked(),
            ...fetcher.getIsFollowed(),
            ...fetcher.getCommentProject(),
          ],
        },
      },
    ]);

    for (const element of thing) {
      const { children, secondLevel } = element;
      const obj = {};

      for (const child of children) {
        obj[child._id] = child;
        child.children = [];
      }

      for (const child of secondLevel) {
        obj[child.parentId].children.push(child);
      }

      delete element.secondLevel;
    }

    return thing;
  };

  async update(
    id: Types.ObjectId,
    dto: UpdatePostCommentDto,
    userId: Types.ObjectId,
  ) {
    const thing: (PostComment & { subredditId: Subreddit | null }) | null =
      await this.postCommentModel
        .findById(id)
        .populate('subredditId', 'flairList');

    if (!thing) {
      throw new BadRequestException(`id : ${id} not found `);
    }

    this.checkIfTheOwner(userId, thing.userId);

    this.checkIfValidFlairId(dto.flair, thing.subredditId.flairList);

    const updatedThing = await this.postCommentModel.findByIdAndUpdate(id, {
      ...dto,
      editedAt: Date.now(),
      editCheckedBy: null,
    });

    if (!updatedThing) {
      throw new NotFoundException(`id : ${id} not found`);
    }

    return { status: 'success' };
  }

  /**
   * Deletes a post or comment from the database (SoftDelete)
   * @param id the id of the thing to be deleted
   * @param userId the user's id
   * @param type the type of the thing
   * @returns success if was able to delete
   */
  remove = async (id: Types.ObjectId, userId: Types.ObjectId, type: string) => {
    const thing: (PostComment & { subredditId: Subreddit | null }) | null =
      await this.postCommentModel
        .findById(id)
        .populate('subredditId', 'moderators');

    if (!thing) {
      throw new NotFoundException(`id : ${id} not found`);
    }

    if (thing.type !== type) {
      throw new BadRequestException(
        `Requested a ${type} but the id belongs to ${thing.type}`,
      );
    }

    //if moderator or the creator can remove the post
    if (
      !(
        thing.userId.equals(userId)
        // TODO: Fix it after it becomes name,
        // || thing.subredditId.moderators.includes(userId) // moderators works with name now
      )
    ) {
      throw new UnauthorizedException(
        `NonModerators can only delete their ${type}`,
      );
    }

    await this.postCommentModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });

    return { status: 'success', timestamp: new Date() };
  };

  getSavedPosts(userId: Types.ObjectId, pagination: PaginationParamsDto) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.filterForSavedOnly(),
      ...fetcher.filterBlocked(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.getMe(),
      ...fetcher.userInfo(),
      ...fetcher.SRInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  getOverviewThings(userId: Types.ObjectId, pagination: PaginationParamsDto) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.matchForSpecificUser(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.userInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  getHistoryThings(userId: Types.ObjectId, pagination: PaginationParamsDto) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.filterBlocked(),
      ...fetcher.voteInfo(),
      {
        $match: {
          $expr: {
            $or: [{ $ne: ['$vote', []] }, { $eq: ['$userId', userId] }],
          },
        },
      },
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.userInfo(),
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  private async changeVotes(
    thingId: Types.ObjectId,
    lastStatus: number,
    curStatus: number,
  ) {
    const res = await this.postCommentModel.findByIdAndUpdate(
      thingId,
      {
        $inc: { votesCount: curStatus - lastStatus },
      },
      { new: true },
    );

    if (!res) {
      throw new NotFoundException(
        `there is no post or comment with id ${thingId}`,
      );
    }

    return { votesCount: res.votesCount };
  }

  private getVotesNum(isUpvote: boolean | undefined) {
    if (isUpvote === undefined) {
      return 0;
    }

    return isUpvote ? 1 : -1;
  }

  async upvote(
    thingId: Types.ObjectId,
    userId: Types.ObjectId,
    dontNotifyIds: Types.ObjectId[],
  ) {
    const res = await this.voteModel.findOneAndUpdate(
      { thingId, userId },
      { isUpvote: true },
      { upsert: true },
    );

    if (res === null && !dontNotifyIds.includes(thingId)) {
      //get thing info
      const [info] = await this.postCommentModel.aggregate([
        { $match: { _id: thingId } },
        {
          $lookup: {
            from: 'subreddits',
            localField: 'subredditId',
            foreignField: '_id',
            as: 'subreddit',
          },
        },
      ]);

      if (info !== undefined && !info.userId.equals(userId)) {
        await this.notificationService.notifyOnVotes(
          info.userId,
          thingId,
          info.type,
          info.subreddit[0].name,
          info.subreddit[0]._id,
        );
      }
    }

    return this.changeVotes(thingId, this.getVotesNum(res?.isUpvote), 1).then();
  }

  async downvote(thingId: Types.ObjectId, userId: Types.ObjectId) {
    const res = await this.voteModel.findOneAndUpdate(
      { thingId, userId },
      { isUpvote: false },
      { upsert: true, new: false },
    );

    return this.changeVotes(thingId, this.getVotesNum(res?.isUpvote), -1);
  }

  async unvote(thingId: Types.ObjectId, userId: Types.ObjectId) {
    const res = await this.voteModel.findOneAndDelete(
      { thingId, userId },
      { new: false },
    );

    return this.changeVotes(thingId, this.getVotesNum(res?.isUpvote), 0);
  }

  async getUpvoted(userId: Types.ObjectId, pagination: PaginationParamsDto) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.matchToGetUpvoteOnly(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.getMe(),
      ...fetcher.userInfo(),
      ...fetcher.SRInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async getDownvoted(userId: Types.ObjectId, pagination: PaginationParamsDto) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.matchToGetDownvoteOnly(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.getMe(),
      ...fetcher.userInfo(),
      ...fetcher.SRInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  searchPostAggregate(
    searchPhrase: string,
    userId: Types.ObjectId,
    page = 1,
    limit = 50,
    sort = 0,
    time = 0,
  ) {
    time = Number(time);
    const fetcher = new ThingFetch(userId);
    const sortTypes = ['best', 'hot', 'top', 'new', 'comments'];
    const filterByDate = time ? fetcher.filterDate(time) : [];

    return this.postCommentModel.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { title: { $regex: searchPhrase, $options: 'i' } },
                { text: { $regex: searchPhrase, $options: 'i' } },
              ],
            },
            { type: 'Post' },
            { isDeleted: false },
            ...filterByDate,
          ],
        },
      },
      {
        $set: {
          thingId: { $toObjectId: '$_id' },
          subredditId: {
            $toObjectId: '$subredditId',
          },
        },
      },
      ...fetcher.filterBlocked(),
      ...fetcher.prepareBeforeStoring(sortTypes[sort]),
      { $sort: fetcher.getSortObject(sortTypes[sort]) },
      ...fetcher.userInfo(),
      ...fetcher.SRInfo(),
      {
        $project: {
          ...postSelectedFileds,
          subreddit: subredditSelectedFields,
          user: userSelectedFields,
        },
      },
      {
        $project: {
          ...postSelectedFileds,
          user: 1,
          subreddit: {
            $arrayElemAt: ['$subreddit', 0],
          },
        },
      },
      ...fetcher.getPaginated(page, limit),
    ]);
  }

  searchCommentQuery = (
    searchPhrase: string,
    userId: Types.ObjectId,
    page = 1,
    limit = 50,
  ) => {
    const fetcher = new ThingFetch(userId);

    return this.postCommentModel.aggregate([
      {
        $match: {
          $and: [
            { text: { $regex: searchPhrase, $options: 'i' } },
            { type: 'Comment' },
          ],
        },
      },
      {
        $set: {
          thingId: { $toObjectId: '$_id' },
          subredditId: {
            $toObjectId: '$subredditId',
          },
          commentPostId: { $toObjectId: '$postId' },
          userId: {
            $toObjectId: '$userId',
          },
        },
      },
      ...fetcher.userInfo(),
      ...fetcher.filterBlocked(),
      ...fetcher.SRInfo(),
      {
        $lookup: {
          from: 'postcomments',
          as: 'post',
          foreignField: '_id',
          localField: 'postId',
        },
      },
      {
        $lookup: {
          from: 'users',
          as: 'postOwner',
          foreignField: '_id',
          localField: 'post.userId',
        },
      },
      {
        $project: {
          ...postSelectedFileds,
          user: userSelectedFields,
          subreddit: subredditSelectedFields,
          post: postSelectedFileds,
          postOwner: userSelectedFields,
        },
      },
      {
        $project: {
          ...postSelectedFileds,
          user: 1,
          subreddit: {
            $arrayElemAt: ['$subreddit', 0],
          },
          post: {
            $arrayElemAt: ['$post', 0],
          },
          postOwner: {
            $arrayElemAt: ['$postOwner', 0],
          },
        },
      },
      ...fetcher.getPaginated(page, limit),
    ]);
  };

  async getThingIModerate(modUsername: string, thingId: Types.ObjectId) {
    return this.postCommentModel.aggregate([
      {
        $match: {
          $expr: {
            $and: [{ isDeleted: false }, { $eq: ['$_id', thingId] }],
          },
        },
      },
      {
        $lookup: {
          from: 'subreddits',
          as: 'subreddit',
          localField: 'subredditId',
          foreignField: '_id',
        },
      },
      {
        $unwind: '$subreddit',
      },
      {
        $match: {
          $expr: {
            $in: [modUsername, { $ifNull: ['$subreddit.moderators', []] }],
          },
        },
      },
    ]);
  }

  async spam(moderatorUsername: string, thingId: Types.ObjectId) {
    const [thing] = await this.getThingIModerate(moderatorUsername, thingId);

    if (!thing) {
      throw new NotFoundException(
        'either the post not found or you are not in the list of the post subreddit moderators',
      );
    }

    if (thing.spammedBy !== null) {
      throw new BadRequestException(`${thing.type} is already spammed`);
    }

    await this.postCommentModel.findByIdAndUpdate(thingId, {
      spammedBy: moderatorUsername,
      spammedAt: Date.now(),
    });

    return { status: 'success' };
  }

  async unspam(modUsername: string, thingId: Types.ObjectId) {
    const [thing] = await this.getThingIModerate(modUsername, thingId);

    if (!thing) {
      throw new NotFoundException(
        'either the post not found or you are not in the list of the post subreddit moderators',
      );
    }

    if (thing.spammedBy === null) {
      throw new BadRequestException('spam is already removed');
    }

    await this.postCommentModel.findByIdAndUpdate(thingId, {
      spammedBy: null,
      spammedAt: null,
    });

    return { status: 'success' };
  }

  async disApprove(modUsername: string, thingId: Types.ObjectId) {
    const [post] = await this.getThingIModerate(modUsername, thingId);

    if (!post) {
      throw new NotFoundException(
        'either wrong id or you are not a moderator of the subreddit',
      );
    }

    if (post.removedBy !== null) {
      throw new BadRequestException('post is already removed');
    }

    await this.postCommentModel.findByIdAndUpdate(thingId, {
      removedBy: modUsername,
      removedAt: Date.now(),
    });

    return { status: 'success' };
  }

  async getThingsOfUser(
    username: string,
    userId: Types.ObjectId | undefined,
    pagination: PaginationParamsDto,
  ) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.userInfo(),
      {
        $match: {
          $expr: {
            $eq: ['$user.username', username],
          },
        },
      },
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.filterBlocked(),
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async getPostsOfOwner(
    ownerId: Types.ObjectId,
    userId: Types.ObjectId,
    pagination: PaginationParamsDto,
  ) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      {
        $match: {
          $expr: {
            $and: [{ $eq: ['$userId', ownerId] }, { $eq: ['$type', 'Post'] }],
          },
        },
      },
      ...fetcher.filterBlocked(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.userInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async getCommentsOfOwner(
    ownerId: Types.ObjectId,
    userId: Types.ObjectId,
    pagination: PaginationParamsDto,
  ) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$userId', ownerId] },
              { $eq: ['$type', 'Comment'] },
            ],
          },
        },
      },
      ...fetcher.filterBlocked(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.SRInfo(),
      ...fetcher.postInfoOfComment(),
      ...fetcher.userInfo(),
      ...fetcher.getCommentProject(),
      {
        $sort: { postId: 1, _id: 1 },
      },
    ]);
  }

  private async getCommonThingsForSubreddit(
    srName: string,
    filter: any,
    pagination: PaginationParamsDto,
  ) {
    const fetcher = new ThingFetch(undefined);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.SRInfo(),
      ...fetcher.matchForSpecificFilter({ ...filter }),
      {
        $match: {
          $expr: {
            $eq: [fetcher.mongoIndexAt('$subreddit.name', 0), srName],
          },
        },
      },
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.userInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async getPostsOfSubreddit(
    subredditId: Types.ObjectId,
    userId: Types.ObjectId | undefined,
    pagination: PaginationParamsDto,
  ) {
    const fetcher = new ThingFetch(userId);
    const { page, limit, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.matchForSpecificFilter({ subredditId }),
      ...fetcher.filterBlocked(),
      ...fetcher.filterHidden(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.userInfo(),
      ...fetcher.voteInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async getUnModeratedThingsForSubreddit(
    srName: string,
    pagination: PaginationParamsDto,
    type: string | undefined,
  ) {
    const filter: any = { approvedBy: null, removedBy: null, spammedBy: null };

    if (type) {
      filter.type = type;
    }

    return this.getCommonThingsForSubreddit(srName, filter, pagination);
  }

  async getSpammedThingsForSubreddit(
    srName: string,
    pagination: PaginationParamsDto,
    type: string | undefined,
  ) {
    const filter: any = {
      spammedBy: { $ne: null },
      isDeleted: false,
      removedBy: null,
    };

    if (type) {
      filter.type = type;
    }

    return this.getCommonThingsForSubreddit(srName, filter, pagination);
  }

  async getEditedThingsForSubreddit(
    srName: string,
    pagination: PaginationParamsDto,
    type: string | undefined,
  ) {
    const filter: any = {
      editedAt: { $ne: null },
      editCheckedBy: null,
      isDeleted: false,
      removedBy: null,
    };

    if (type) {
      filter.type = type;
    }

    return this.getCommonThingsForSubreddit(srName, filter, pagination);
  }
}

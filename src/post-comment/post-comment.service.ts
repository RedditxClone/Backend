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
import type { FilterPostCommentDto } from './dto/filter-post-comment.dto';
import type { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import type { PostComment } from './post-comment.schema';
import { ThingFetch } from './post-comment.utils';

/**
 * class for PostComment module
 */
@Injectable()
export class PostCommentService {
  /**
   * Class constructor
   * @param postCommentModel mongoose model
   * @param voteModel mongoose model
   * @param notificationService notification service
   */
  constructor(
    @InjectModel('PostComment')
    private readonly postCommentModel: Model<PostComment>,
    @InjectModel('Vote') private readonly voteModel: Model<Vote>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Check whether the user is the owner of the post
   * @param userId MongoId of user
   * @param postUserId MongoId of post
   * @trhows UnauthorizedException if the user is not the owner
   */
  checkIfTheOwner(
    userId: Types.ObjectId,
    postUserId: Types.ObjectId | undefined,
  ): void | never {
    if (userId.toString() === postUserId?.toString()) {
      return;
    }

    throw new UnauthorizedException('only the owner can do this operation');
  }

  /**
   * Check whether a flair id is valid
   * @param flairId MongoId of flair
   * @param flairs List of flairs
   * @throws BadRequestException if flair is not included
   */
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
    userId: Types.ObjectId | undefined,
  ) => {
    const fetcher = new ThingFetch(userId);
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

  /**
   * update a post or comment
   * @param id MongoId of postcomment
   * @param dto postcomment information
   * @param userId MongoId user
   * @returns status: success
   */
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
  remove = async (
    id: Types.ObjectId,
    userId: Types.ObjectId,
    type: string,
    username: string,
  ) => {
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

    //if not moderator or the creator can remove the post
    if (
      !thing.userId.equals(userId) &&
      !thing.subredditId.moderators.includes(username)
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

  /**
   * Get user's saved posts
   * @param userId MongoId of user
   * @param pagination  pagination page number and offset
   * @returns list of posts
   */
  getSavedPosts(userId: Types.ObjectId, pagination: PaginationParamsDto) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.filterForSavedOnly(),
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
  }

  /**
   * Get overview posts or comments
   * @param userId MongoId of user
   * @param pagination  pagination page number and offset
   * @returns list of things
   */
  getOverviewThings(userId: Types.ObjectId, pagination: PaginationParamsDto) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.matchForSpecificUser(),
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

  /**
   * Get history posts or comments
   * @param userId MongoId of user
   * @param pagination  pagination page number and offset
   * @returns list of things
   */
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
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.filterBannedUsers(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.userInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  /**
   * Update vote count on post or comment
   * @param thingId MongoId of postcomment
   * @param lastStatus previous vote count
   * @param curStatus new vote count
   * @returns votesCount: new vote count
   */
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

  /**
   * Get vote enum
   * @param isUpvote whether the vote enum is an upvote
   * @returns numeric represenation of vote action
   */
  private getVotesNum(isUpvote: boolean | undefined) {
    if (isUpvote === undefined) {
      return 0;
    }

    return isUpvote ? 1 : -1;
  }

  /**
   * Upvote a post or comment
   * @param thingId MongoId of post or comment
   * @param userId MongoId user
   * @param dontNotifyIds List of ids to not create notifcations for
   * @returns new vote count
   */
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

  /**
   * Downvote a post or comment
   * @param thingId MongoId of post or comment
   * @param userId MongoId of user
   * @returns new vote count
   */
  async downvote(thingId: Types.ObjectId, userId: Types.ObjectId) {
    const res = await this.voteModel.findOneAndUpdate(
      { thingId, userId },
      { isUpvote: false },
      { upsert: true, new: false },
    );

    return this.changeVotes(thingId, this.getVotesNum(res?.isUpvote), -1);
  }

  /**
   * Remove an existing vote
   * @param thingId MongoId of post or comment
   * @param userId MongoId of user
   * @returns new vote count
   */
  async unvote(thingId: Types.ObjectId, userId: Types.ObjectId) {
    const res = await this.voteModel.findOneAndDelete(
      { thingId, userId },
      { new: false },
    );

    return this.changeVotes(thingId, this.getVotesNum(res?.isUpvote), 0);
  }

  /**
   * Get posts or comments upvoted
   * @param userId MongoId of user
   * @param pagination  pagination page number and offset
   * @returns list of things
   */
  async getUpvoted(userId: Types.ObjectId, pagination: PaginationParamsDto) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.matchToGetUpvoteOnly(),
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.filterBannedUsers(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.userInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  /**
   * Get posts or comments downvoted
   * @param userId MongoId of user
   * @param pagination  pagination page number and offset
   * @returns list of things
   */
  async getDownvoted(userId: Types.ObjectId, pagination: PaginationParamsDto) {
    const fetcher = new ThingFetch(userId);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.matchToGetDownvoteOnly(),
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.filterBannedUsers(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.userInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  /**
   * Search for posts
   * @param searchPhrase searchy query
   * @param userId MongoId of user
   * @param page pagination page number
   * @param limit pagination limit
   * @param sort sort query
   * @param time time query
   * @returns list of posts
   */
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
      {
        $set: {
          images: {
            $map: {
              input: '$images',
              as: 'image',
              in: { $concat: ['/assets/posts-media/', '$$image'] },
            },
          },
        },
      },
    ]);
  }

  /**
   * Search for comments
   * @param searchPhrase searchy query
   * @param userId MongoId of user
   * @param page pagination page number
   * @param limit pagination limit
   * @param sort sort query
   * @param time time query
   * @returns list of comments
   */
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

  /**
   * Get post or comments I moderate
   * @param modUsername username of moderator
   * @param thingId MongoId of post or comment
   */
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

  /**
   * Report a post or comment as spam
   * @param moderatorUsername username of moderator
   * @param thingId MonogId of post or comment
   * @returns status: success
   */
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
      approvedBy: null,
      approvedAt: null,
      removedBy: null,
      removedAt: null,
    });

    return { status: 'success' };
  }

  /**
   * remove spam report from a post or comment
   * @param moderatorUsername username of moderator
   * @param thingId MonogId of post or comment
   * @returns status: success
   */
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

  /**
   * Disapprove a post or comment
   * @param modUsername username of moderator
   * @param thingId MongoId of post or comment
   * @returns status: success
   */
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
      spammedBy: null,
      spammedAt: null,
      approvedBy: null,
      approvedAt: null,
    });

    return { status: 'success' };
  }

  /**
   * Get posts and comments of a user
   * @param username username of user
   * @param userId MongoId of user
   * @param pagination  pagination page number and offset
   * @returns list of things
   */
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
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.filterBannedUsers(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.filterBlocked(),
      ...fetcher.getPostProject(),
    ]);
  }

  /**
   * Get posts of an owner
   * @param ownerId MongoId of owner
   * @param userId MongoId of user
   * @param pagination  pagination page number and offset
   * @returns list of posts
   */
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
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.filterBannedUsers(),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.userInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  /**
   * Get comments of an owner
   * @param ownerId MongoId of owner
   * @param userId MongoId of user
   * @param pagination  pagination page number and offset
   * @returns list of comments
   */
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

  /**
   * Get common posts and comments of a subreddit
   * @param srName name of subreddit
   * @param filter query params
   * @param pagination  pagination page number and offset
   * @returns list of things
   */
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

  /**
   * Get posts of a subreddit
   * @param srName name of subreddit
   * @param userId MongoId of user
   * @param pagination  pagination page number and offset
   * @returns list of posts
   */
  async getPostsOfSubreddit(
    srName: string,
    userId: Types.ObjectId | undefined,
    pagination: PaginationParamsDto,
  ) {
    const fetcher = new ThingFetch(userId);
    const { page, limit, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.SRInfo(),
      {
        $match: {
          $expr: {
            $eq: [fetcher.mongoIndexAt('$subreddit.name', 0), srName],
          },
        },
      },
      ...fetcher.filterBlocked(),
      ...fetcher.filterHidden(),
      ...fetcher.getMe(),
      ...fetcher.SRInfo(),
      ...fetcher.filterUnApproved(),
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

  /**
   * Get unmoderated posts and comments
   * @param srName name of subreddit
   * @param pagination
   * @param type filtering type
   * @returns list of things
   */
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

  /**
   * Get spammed posts and comments
   * @param srName name of subreddit
   * @param pagination pagination page number and offset
   * @param type filtering type
   * @returns list of things
   */
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

  /**
   * Get edited posts and comments
   * @param srName name of subreddit
   * @param pagination pagination page number and offset
   * @param type filtering type
   * @returns list of things
   */
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

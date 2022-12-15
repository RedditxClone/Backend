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
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { PaginationParamsDto } from '../utils/apiFeatures/dto';
import {
  postSelectedFileds,
  subredditSelectedFields,
  userSelectedFields,
} from '../utils/project-selected-fields';
import type { Vote } from '../vote/vote.schema';
import type { CreatePostCommentDto } from './dto/create-post-comment.dto';
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
    private readonly featureService: ApiFeaturesService,
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

  private checkIfTheOwner(
    userId: Types.ObjectId,
    postUserId: Types.ObjectId | undefined,
  ): void | never {
    if (userId.toString() === postUserId?.toString()) {
      return;
    }

    throw new UnauthorizedException('only the owner can do this operation');
  }

  private checkIfValidFlairId(
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
      ...fetcher.userInfo(),
      ...fetcher.SRInfo(),
      ...fetcher.voteInfo(),
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
          userId,
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
      ...fetcher.userInfo(),
      ...fetcher.SRInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  searchPostAggregate(
    searchPhrase: string,
    userId: Types.ObjectId,
    page,
    limit,
  ) {
    const fetcher = new ThingFetch(userId);

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
      ...fetcher.userInfo(),
      ...fetcher.filterBlocked(),
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
            $in: [modUsername, '$subreddit.moderators'],
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
      ...fetcher.SRInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  private async getCommonThingsForSubreddit(
    subredditId: Types.ObjectId,
    filter: any,
    pagination: PaginationParamsDto,
  ) {
    const fetcher = new ThingFetch(undefined);
    const { limit, page, sort } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.matchForSpecificFilter({ ...filter, subredditId }),
      ...fetcher.prepareBeforeStoring(sort),
      {
        $sort: fetcher.getSortObject(sort),
      },
      ...fetcher.getPaginated(page, limit),
      ...fetcher.userInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async getUnModeratedThingsForSubreddit(
    subredditId: Types.ObjectId,
    pagination: PaginationParamsDto,
  ) {
    return this.getCommonThingsForSubreddit(
      subredditId,
      { approvedBy: null, removedBy: null, spammedBy: null },
      pagination,
    );
  }

  async getSpammedThingsForSubreddit(
    subredditId: Types.ObjectId,
    pagination: PaginationParamsDto,
  ) {
    return this.getCommonThingsForSubreddit(
      subredditId,
      {
        spammedBy: { $ne: null },
        isDeleted: false,
        removedBy: null,
      },
      pagination,
    );
  }

  async getEditedThingsForSubreddit(
    subredditId: Types.ObjectId,
    pagination: PaginationParamsDto,
  ) {
    return this.getCommonThingsForSubreddit(
      subredditId,
      {
        editedAt: { $ne: null },
        editCheckedBy: null,
        isDeleted: false,
        removedBy: null,
      },
      pagination,
    );
  }
}

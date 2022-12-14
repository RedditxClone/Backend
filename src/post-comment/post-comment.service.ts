import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';
import type { PaginationParamsDto } from 'utils/apiFeatures/dto';

import type { Flair, Subreddit } from '../subreddit/subreddit.schema';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { Vote } from '../vote/vote.schema';
// import { SubredditService } from '../subreddit/subreddit.service';
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
    const { limit, page } = pagination;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.filterForSavedOnly(),
      ...fetcher.filterBlocked(),
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

  async upvote(thingId: Types.ObjectId, userId: Types.ObjectId) {
    const res = await this.voteModel.findOneAndUpdate(
      { thingId, userId },
      { isUpvote: true },
      { upsert: true, new: false },
    );

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

  searchPostQuery = (searchPhrase: string, usersBlockedMe) =>
    this.postCommentModel
      .find({
        $or: [
          { title: { $regex: searchPhrase, $options: 'i' } },
          { text: { $regex: searchPhrase, $options: 'i' } },
        ],
        _id: { $not: { $all: usersBlockedMe.map((v) => v.blocker) } },
        type: 'Post',
      })
      .populate([
        {
          path: 'subredditId',
          model: 'Subreddit',
          select: 'name',
        },
        {
          path: 'userId',
          model: 'User',
          select: 'username profilePhoto',
        },
      ]);

  searchCommentQuery = (searchPhrase: string, usersBlockedMe) =>
    this.postCommentModel
      .find({
        text: { $regex: searchPhrase, $options: 'i' },
        userId: { $not: { $all: usersBlockedMe.map((v) => v.blocker) } },
        type: 'Comment',
      })
      .populate([
        {
          path: 'postId',
          model: 'Post',
          select: 'title publishedDate',
          populate: [
            {
              path: 'userId',
              model: 'User',
              select: 'username profilePhoto',
            },
          ],
        },
        {
          path: 'userId',
          model: 'User',
          select: 'username profilePhoto',
        },
        {
          path: 'subredditId',
          model: 'Subreddit',
          select: 'name',
        },
      ]);

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

  async getThingsOfUser(username: string, userId: Types.ObjectId | undefined) {
    const fetcher = new ThingFetch(userId);

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
      ...fetcher.filterBlocked(),
      ...fetcher.SRInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  private async getCommonThingsForSubreddit(
    subredditId: Types.ObjectId,
    filter: any,
    paginationParameters: any,
  ) {
    const fetcher = new ThingFetch(undefined);
    const { limit, page } = paginationParameters;

    return this.postCommentModel.aggregate([
      ...fetcher.prepare(),
      ...fetcher.matchForSpecificFilter({ ...filter, subredditId }),
      ...fetcher.getPaginated(limit, page),
      ...fetcher.userInfo(),
      ...fetcher.getPostProject(),
    ]);
  }

  async getUnModeratedThingsForSubreddit(
    subredditId: Types.ObjectId,
    limit: number | undefined,
    page: number | undefined,
    sort: string | undefined,
  ) {
    return this.getCommonThingsForSubreddit(
      subredditId,
      { approvedBy: null, removedBy: null, spammedBy: null },
      { limit, page, sort },
    );
  }

  async getSpammedThingsForSubreddit(
    subredditId: Types.ObjectId,
    limit: number | undefined,
    page: number | undefined,
    sort: string | undefined,
  ) {
    return this.getCommonThingsForSubreddit(
      subredditId,
      {
        spammedBy: { $ne: null },
        isDeleted: false,
        removedBy: null,
      },
      { limit, page, sort },
    );
  }

  async getEditedThingsForSubreddit(
    subredditId: Types.ObjectId,
    limit: number | undefined,
    page: number | undefined,
    sort: string | undefined,
  ) {
    return this.getCommonThingsForSubreddit(
      subredditId,
      {
        editedAt: { $ne: null },
        editCheckedBy: null,
        isDeleted: false,
        removedBy: null,
      },
      { limit, page, sort },
    );
  }
}

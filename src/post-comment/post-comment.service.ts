import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import type { Flair, Subreddit } from '../subreddit/subreddit.schema';
// import { SubredditService } from '../subreddit/subreddit.service';
import type { CreatePostCommentDto } from './dto/create-post-comment.dto';
import type { FilterPostCommentDto } from './dto/filter-post-comment.dto';
import type { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import type { PostComment } from './post-comment.schema';

@Injectable()
export class PostCommentService {
  constructor(
    @InjectModel('PostComment')
    private readonly postCommentModel: Model<PostComment>,
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

  /**
   * Gets a graph of comments/posts
   * @param filter the filter of the parent
   * @returns and array of things with an array of comments
   */
  getThings = async (filter: FilterPostCommentDto) => {
    if (!filter.subredditId || !filter.userId) {
      filter.type = 'Post';
    }

    const thing: PostComment[] | null = await this.postCommentModel.aggregate([
      { $match: filter }, // filter
      {
        $graphLookup: {
          from: 'postcomments',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          depthField: 'depth',
          as: 'comments',
          restrictSearchWithMatch: {
            isDeleted: false,
          },
        },
      },
      {
        $unwind: {
          path: '$comments',
        },
      },
      {
        //todo need to add sort filter ex. hot, rising, ...
        $sort: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'comments.depth': 1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'comments.createdDate': 1,
        },
      },
      {
        $group: {
          _id: {
            body: '$body',
            _id: '$_id',
          },
          comments: {
            $push: '$comments',
          },
        },
      },
      {
        $project: {
          body: '$_id.body',
          _id: '$_id._id',
          comments: '$comments',
        },
      },
    ]);

    //! may need to be removed
    if (!Array.isArray(thing) || thing.length === 0) {
      throw new NotFoundException(`The filter sent resulted in no outputs`);
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

    const updatedThing = await this.postCommentModel.findByIdAndUpdate(id, dto);

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
        thing.userId.equals(userId) ||
        thing.subredditId.moderators.includes(userId)
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
}

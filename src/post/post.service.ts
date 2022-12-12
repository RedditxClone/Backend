import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

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

  prepareToGetPost() {
    return [
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $set: {
          postId: { $toObjectId: '$_id' },
          subredditId: {
            $toObjectId: '$subredditId',
          },
          userId: {
            $toObjectId: '$userId',
          },
        },
      },
    ];
  }

  getPostsOfMySRs(userId: Types.ObjectId) {
    return [
      {
        $lookup: {
          from: 'usersubreddits',
          as: 'PostUserSubreddit',
          let: {
            subredditId: '$subredditId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$subredditId', '$$subredditId'] },
                    { $eq: ['$userId', userId] },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $unwind: '$PostUserSubreddit',
      },
    ];
  }

  filterHiddenPosts(userId: Types.ObjectId) {
    return [
      {
        $lookup: {
          from: 'hides',
          as: 'hide',
          let: {
            postId: '$postId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$$postId', '$postId'] },
                    { $eq: ['$userId', userId] },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $match: {
          $expr: {
            $eq: ['$hide', []],
          },
        },
      },
    ];
  }

  filterBlockedPosts(userId: Types.ObjectId) {
    return [
      {
        $lookup: {
          from: 'blocks',
          as: 'block',
          let: {
            userId: '$userId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $eq: ['$blocked', userId] },
                        { $eq: ['$blocker', '$$userId'] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ['$blocker', userId] },
                        { $eq: ['$blocked', '$$userId'] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $match: {
          $expr: {
            $eq: ['$block', []],
          },
        },
      },
    ];
  }

  getPostSRInfo() {
    return [
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
    ];
  }

  getPostUserInfo() {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
    ];
  }

  getPostVotesInfo(userId: Types.ObjectId) {
    return [
      {
        $lookup: {
          from: 'votes',
          as: 'vote',
          let: {
            postId: '$postId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$$postId', '$thingId'] },
                    { $eq: ['$userId', userId] },
                  ],
                },
              },
            },
          ],
        },
      },
    ];
  }

  getPostProjectParameters() {
    return [
      {
        $project: {
          text: 1,
          title: 1,
          userId: 1,
          postId: 1,
          subreddit: {
            id: '$subreddit._id',
            name: '$subreddit.name',
          },
          votesCount: 1,
          commentCount: 1,
          publishedDate: 1,
          flair: 1,
          spoiler: 1,
          nsfw: 1,
          // vote: 1,
          voteType: {
            $cond: [
              { $eq: ['$vote', []] },
              undefined,
              {
                $cond: [
                  { $eq: ['$vote.isUpvote', [true]] },
                  'upvote',
                  {
                    $cond: [
                      { $eq: ['$vote.isUpvote', [false]] },
                      'downvote',
                      undefined,
                    ],
                  },
                ],
              },
            ],
          },
          images: 1,
          user: {
            id: '$user._id',
            photo: '$user.profilePhoto',
            username: '$user.username',
          },
        },
      },
    ];
  }

  private getRandomTimeLine() {
    return this.postModel.aggregate([
      ...this.prepareToGetPost(),
      {
        $sample: { size: 15 },
      },
      ...this.getPostSRInfo(),
      ...this.getPostUserInfo(),
      ...this.getPostProjectParameters(),
    ]);
  }

  private async getUserTimeLine(userId: Types.ObjectId) {
    return this.postModel.aggregate([
      ...this.prepareToGetPost(),
      ...this.getPostsOfMySRs(userId),
      ...this.filterHiddenPosts(userId),
      ...this.filterBlockedPosts(userId),
      ...this.getPostSRInfo(),
      ...this.getPostUserInfo(),
      ...this.getPostVotesInfo(userId),
      ...this.getPostProjectParameters(),
    ]);
  }

  async getTimeLine(userId: Types.ObjectId | undefined) {
    if (!userId) {
      return this.getRandomTimeLine();
    }

    return this.getUserTimeLine(userId);
  }
}

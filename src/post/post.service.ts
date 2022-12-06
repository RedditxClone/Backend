import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { UserWithId } from 'user/user.schema';

import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { CreatePostDto, UpdatePostDto } from './dto';
import { UploadMediaDto } from './dto';
import type { Post } from './post.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<Post>,
    private readonly apiFeatures: ApiFeaturesService,
  ) {}

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

  private getRandomTimeLine() {
    return this.postModel.aggregate([
      {
        $sample: { size: 15 },
      },
    ]);
  }

  private async getUserTimeLine(user: UserWithId) {
    return this.postModel.aggregate([
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
                    { $eq: ['$userId', user._id] },
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
        $project: {
          text: 1,
          title: 1,
          userId: 1,
          upvotesCount: 1,
          downvotesCount: 1,
          images: 1,
          postId: 1,
          commentCount: 1,
          publishedDate: 1,
          subreddit: {
            id: '$subredditId',
            name: '$subreddit.name',
            type: '$subreddit.type',
          },
        },
      },
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
                        { $eq: ['$blocked', user._id] },
                        { $eq: ['$blocker', '$$userId'] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ['$blocker', user._id] },
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
      {
        $lookup: {
          from: 'vote',
          as: 'vote',
          let: {
            postId: '$postId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$$postId', '$thingId'] }, { $eq: [] }],
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          text: 1,
          title: 1,
          userId: 1,
          postId: 1,
          subreddit: 1,
          upvotesCount: 1,
          downvotesCount: 1,
          commentCount: 1,
          publishedDate: 1,
          images: 1,
          user: {
            id: '$user._id',
            photo: '$user.profilePhoto',
            username: '$user.username',
          },
        },
      },
    ]);
  }

  async getTimeLine(req: Request & { user: UserWithId | undefined }) {
    if (!req.user) {
      return this.getRandomTimeLine();
    }

    return this.getUserTimeLine(req.user);
  }
}

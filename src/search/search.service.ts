import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import { BlockService } from '../block/block.service';
// import type { Comment } from '../comment/comment.schema';
// import type { Post } from '../post/post.schema';
// import type { Subreddit } from '../subreddit/subreddit.schema';
import type { User } from '../user/user.schema';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    // @InjectModel('post') private readonly postModel: Model<Post>,
    // @InjectModel('Subreddit') private readonly subredditModel: Model<Subreddit>,
    // @InjectModel('Comment') private readonly commentModel: Model<Comment>,
    private readonly apiFeaturesService: ApiFeaturesService,
    private readonly blockService: BlockService,
  ) {}

  getUsersBlockedMe = async (blocker: Types.ObjectId) =>
    this.blockService.getBlockerUsersIds(blocker);

  searchPeople = async (
    data: string,
    numberOfData: number,
    blocker: Types.ObjectId,
  ) => {
    const users = await this.getUsersBlockedMe(blocker);

    return this.apiFeaturesService.processQuery(
      this.userModel
        .find({
          username: new RegExp(`^${data}`),
          _id: { $not: { $all: users.map((v) => v.blocker) } },
        })
        .select('username profilePhoto about'),
      { limit: numberOfData },
      { pagination: true },
    );
  };

  // searchCommunities = (data: string, numberOfData: number) =>
  //   this.apiFeaturesService.processQuery(
  //     this.subredditModel.find(
  //       { name: new RegExp(`^${data}`) },
  //       { description: new RegExp(`*${data}*`) },
  //     ),
  //     { limit: numberOfData },
  //     { pagination: true },
  //   );

  // searchPosts = async (data: string, numberOfData: number) =>
  //   this.apiFeaturesService.processQuery(
  //     this.postModel
  //       .find({
  //         $or: [
  //           { title: new RegExp(`^${data}`) },
  //           { text: new RegExp(`*${data}*`) },
  //         ],
  //       })
  //       .populate([
  //         {
  //           path: 'user_id',
  //           model: 'Post',
  //           // populate: {
  //           //   path: 'country',
  //           //   model: 'Country',
  //           // },
  //         },
  //       ]),
  //     { limit: numberOfData },
  //     { pagination: true },
  //   );

  // searchComments = (data: string, numberOfData: number) =>
  //   this.apiFeaturesService.processQuery(
  //     this.commentModel.find({ text: new RegExp(`*${data}*`) }).populate([
  //       {
  //         path: 'postId',
  //         model: 'Post',
  //         select: 'title publishedDate',
  //         // populate: {
  //         //   path: 'country',
  //         //   model: 'Country',
  //         // },
  //       },
  //       {
  //         path: 'userId',
  //         model: 'User',
  //         select: 'username profilePhoto',
  //       },
  //     ]),
  //     { limit: numberOfData },
  //     { pagination: true },
  //   );
}

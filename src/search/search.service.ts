import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { Post } from '../post/post.schema';
import type { PostComment } from '../post-comment/post-comment.schema';
import type { Subreddit } from '../subreddit/subreddit.schema';
// import { BlockService } from '../block/block.service';
import type { User } from '../user/user.schema';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('post') private readonly postModel: Model<Post>,
    @InjectModel('Subreddit') private readonly subredditModel: Model<Subreddit>,
    private readonly postCommentModel: Model<PostComment>,
    private readonly apiFeaturesService: ApiFeaturesService, // private readonly blockService: BlockService,
  ) {}

  searchPeople = async (
    data: string,
    numberOfData: number,
    // blocker: Types.ObjectId,
  ) =>
    this.apiFeaturesService.processQuery(
      this.userModel.find({
        username: new RegExp(`^${data}`),
      }),
      { limit: numberOfData },
      { pagination: true },
    );

  searchPosts = async (data: string, numberOfData: number) =>
    this.apiFeaturesService.processQuery(
      this.postModel.find({
        $or: [
          { title: new RegExp(`^${data}`) },
          { text: new RegExp(`*${data}*`) },
        ],
      }),
      { limit: numberOfData },
      { pagination: true },
    );

  searchCommunities = (data: string, numberOfData: number) =>
    this.apiFeaturesService.processQuery(
      this.subredditModel.find(
        { name: new RegExp(`^${data}`) },
        { description: new RegExp(`*${data}*`) },
      ),
      { limit: numberOfData },
      { pagination: true },
    );

  searchComments = (data: string, numberOfData: number) =>
    this.apiFeaturesService.processQuery(
      this.postCommentModel.find({ type: new RegExp(`*${data}*`) }),
      { limit: numberOfData },
      { pagination: true },
    );
}

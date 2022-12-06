import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import { BlockService } from '../block/block.service';
import type { Comment } from '../comment/comment.schema';
import type { Post } from '../post/post.schema';
import type { Subreddit } from '../subreddit/subreddit.schema';
import type { User } from '../user/user.schema';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Subreddit') private readonly subredditModel: Model<Subreddit>,
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
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
    const usersBlockedMe = await this.getUsersBlockedMe(blocker);

    return this.apiFeaturesService.processQuery(
      this.userModel
        .find({
          username: new RegExp(`^${data}`),
          _id: { $not: { $all: usersBlockedMe.map((v) => v.blocker) } },
        })
        .select('username profilePhoto about'),
      { limit: numberOfData },
      { pagination: true },
    );
  };

  searchCommunities = async (data: string, numberOfData: number) => {
    await this.apiFeaturesService.processQuery(
      this.subredditModel.find(
        { name: new RegExp(`^${data}`) },
        { description: { $regex: data } },
      ),
      { limit: numberOfData },
      { pagination: true },
    );
  };

  searchPosts = async (
    data: string,
    numberOfData: number,
    blocker: Types.ObjectId,
  ) => {
    const usersBlockedMe = await this.getUsersBlockedMe(blocker);

    return this.apiFeaturesService.processQuery(
      this.postModel
        .find({
          $or: [{ title: { $regex: data } }, { text: { $regex: data } }],
          _id: { $not: { $all: usersBlockedMe.map((v) => v.blocker) } },
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
        ]),
      { limit: numberOfData },
      { pagination: true },
    );
  };

  searchComments = async (
    data: string,
    numberOfData: number,
    blocker: Types.ObjectId,
  ) => {
    const usersBlockedMe = await this.getUsersBlockedMe(blocker);

    return this.apiFeaturesService.processQuery(
      this.commentModel
        .find({
          text: { $regex: data },
          userId: { $not: { $all: usersBlockedMe.map((v) => v.blocker) } },
        })
        .populate([
          {
            path: 'postId',
            model: 'Post',
            select: 'title publishedDate',
            populate: [
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
            ],
          },
          {
            path: 'userId',
            model: 'User',
            select: 'username profilePhoto',
          },
        ]),
      { limit: numberOfData },
      { pagination: true },
    );
  };
}

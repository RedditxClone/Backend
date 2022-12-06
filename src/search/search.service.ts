import { Injectable } from '@nestjs/common';
import type { Types } from 'mongoose';

import { BlockService } from '../block/block.service';
import { PostCommentService } from '../post-comment/post-comment.service';
import { SubredditService } from '../subreddit/subreddit.service';
import { UserService } from '../user/user.service';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly blockService: BlockService,
    private readonly apiFeaturesService: ApiFeaturesService,
    private readonly userService: UserService,
    private readonly postCommentService: PostCommentService,
    private readonly subredditService: SubredditService,
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
      this.userService.searchUserQuery(usersBlockedMe, data),
      { limit: numberOfData },
      { pagination: true },
    );
  };

  // searchCommunities = async (data: string, numberOfData: number) => {
  //   await this.apiFeaturesService.processQuery(
  //     this.subredditModel.find(
  //       { name: new RegExp(`^${data}`) },
  //       { description: { $regex: data } },
  //     ),
  //     { limit: numberOfData },
  //     { pagination: true },
  //   );
  // };

  searchPosts = async (
    data: string,
    numberOfData: number,
    blocker: Types.ObjectId,
  ) => {
    const usersBlockedMe = await this.getUsersBlockedMe(blocker);

    return this.apiFeaturesService.processQuery(
      this.postCommentService.searchPostQuery(data, usersBlockedMe),
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
      this.postCommentService.searchCommentQuery(data, usersBlockedMe),
      { limit: numberOfData },
      { pagination: true },
    );
  };
}

import { Injectable } from '@nestjs/common';
import type { Types } from 'mongoose';

import { PostCommentService } from '../post-comment/post-comment.service';
import { SubredditService } from '../subreddit/subreddit.service';
import { UserService } from '../user/user.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly userService: UserService,
    private readonly postCommentService: PostCommentService,
    private readonly subredditService: SubredditService,
  ) {}

  searchPeople(data: string, page, numberOfData, blocker: Types.ObjectId) {
    return this.userService.searchPeopleAggregate(
      data,
      blocker,
      page,
      numberOfData,
    );
  }

  searchCommunities = async (
    data: string,
    userId: Types.ObjectId,
    page,
    numberOfData,
  ) => {
    let usernameData;

    try {
      const { username } = await this.userService.getUserById(userId);
      usernameData = username;
    } catch {
      /* empty */
    }

    return this.subredditService.getSearchSubredditAggregation(
      data,
      usernameData,
      userId,
      page,
      numberOfData,
    );
  };

  searchCommunitiesStartsWith = async (
    data: string,
    userId: Types.ObjectId,
    page,
    numberOfData,
  ) => {
    let usernameData;

    try {
      const { username } = await this.userService.getUserById(userId);
      usernameData = username;
    } catch {
      /* empty */
    }

    return this.subredditService.getSubredditStartsWithChar(
      data,
      usernameData,
      userId,
      page,
      numberOfData,
    );
  };

  searchPosts = (
    data: string,
    page = 1,
    numberOfData = 50,
    blocker: Types.ObjectId,
  ) =>
    this.postCommentService.searchPostAggregate(
      data,
      blocker,
      page,
      numberOfData,
    );

  searchComments = async (
    data: string,
    page,
    numberOfData: number,
    blocker: Types.ObjectId,
  ) =>
    this.postCommentService.searchCommentQuery(
      data,
      blocker,
      page,
      numberOfData,
    );

  searchFlairs = async (
    data: string,
    subreddit: Types.ObjectId,
    page,
    limit,
  ) => {
    const res = await this.subredditService.getSearchFlairsAggregate(
      data,
      subreddit,
      page,
      limit,
    );

    return res.map((v) => v.flair);
  };
}

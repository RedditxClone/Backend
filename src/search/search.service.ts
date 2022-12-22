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

  searchCommunities = async (data: string, page, numberOfData, user?) =>
    this.subredditService.getSearchSubredditAggregation(
      data,
      user?.username,
      user?._id,
      page,
      numberOfData,
    );

  searchCommunitiesStartsWith = async (
    data: string,
    page,
    numberOfData,
    user?,
  ) =>
    this.subredditService.getSubredditStartsWithChar(
      data,
      user?.username,
      user?._id,
      page,
      numberOfData,
    );

  searchPosts = (data: string, query, blocker: Types.ObjectId) =>
    this.postCommentService.searchPostAggregate(
      data,
      blocker,
      query.page,
      query.limit,
      query.sort,
      query.time,
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

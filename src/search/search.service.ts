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

  /**
   * Search for people
   * @param data search query
   * @param page pagination page
   * @param numberOfData items per page
   * @param blocker MongoId of searching user
   * @returns List of people
   */
  searchPeople(data: string, page, numberOfData, blocker: Types.ObjectId) {
    return this.userService.searchPeopleAggregate(
      data,
      blocker,
      page,
      numberOfData,
    );
  }

  /**
   * Search for communities
   * @param data search query
   * @param page pagination page
   * @param numberOfData items per page
   * @param user MongoId of searching user
   * @returns List of communities
   */
  searchCommunities = async (data: string, page, numberOfData, user?) =>
    this.subredditService.getSearchSubredditAggregation(
      data,
      user?.username,
      user?._id,
      page,
      numberOfData,
    );

  /**
   * Search for communities that start with the search query
   * @param data search query
   * @param page pagination page
   * @param numberOfData items per page
   * @param user MongoId of searching user
   * @returns List of communities
   */
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

  /**
   * Search for posts
   * @param data search query
   * @param query search parameters
   * @param blocker MongoId of searching user
   * @returns List of posts
   */
  searchPosts = (data: string, query, blocker: Types.ObjectId) =>
    this.postCommentService.searchPostAggregate(
      data,
      blocker,
      query.page,
      query.limit,
      query.sort,
      query.time,
    );

  /**
   * Search for comments
   * @param data search query
   * @param page pagination page
   * @param numberOfData items per page
   * @param blocker MongoId of searching user
   * @returns List of comments
   */
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

  /**
   * Search for flairs
   * @param data search query
   * @param subreddit MongoId of subreddit
   * @param page pagination page
   * @param limit items per page
   * @returns List of flairs
   */
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

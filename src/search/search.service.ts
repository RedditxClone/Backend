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
    page,
    numberOfData: number,
    blocker: Types.ObjectId,
  ) => {
    const usersBlockedMe = await this.getUsersBlockedMe(blocker);

    return this.apiFeaturesService.processQuery(
      this.userService.searchUserQuery(usersBlockedMe, data),
      { limit: numberOfData, page },
      { pagination: true },
    );
  };

  searchCommunities = async (data: string, page, numberOfData) =>
    this.subredditService.getSearchSubredditAggregation(
      data,
      page,
      numberOfData,
    );

  searchPosts = async (
    data: string,
    page,
    numberOfData: number,
    blocker: Types.ObjectId,
  ) => {
    const usersBlockedMe = await this.getUsersBlockedMe(blocker);
    const unformattedData = await this.apiFeaturesService.processQuery(
      this.postCommentService.searchPostQuery(data, usersBlockedMe),
      { limit: numberOfData, page },
      { pagination: true },
    );

    return unformattedData.map((el) => {
      const { _doc } = el;
      _doc.user = _doc.userId;
      _doc.subreddit = _doc.subredditId;
      delete _doc.userId;
      delete _doc.subredditId;

      return _doc;
    });
  };

  searchComments = async (
    data: string,
    page,
    numberOfData: number,
    blocker: Types.ObjectId,
  ) => {
    const usersBlockedMe = await this.getUsersBlockedMe(blocker);

    const unformattedData = await this.apiFeaturesService.processQuery(
      this.postCommentService.searchCommentQuery(data, usersBlockedMe),
      { limit: numberOfData, page },
      { pagination: true },
    );

    return unformattedData.map((el) => {
      const { _doc } = el;
      _doc.user = _doc.userId;
      _doc.subreddit = _doc.subredditId;
      delete _doc.userId;
      delete _doc.subredditId;
      _doc.postId.user = _doc.postId._doc.userId;
      delete _doc.postId._doc.userId;
      _doc.post = _doc.postId;
      delete _doc.postId;

      return _doc;
    });
  };
}

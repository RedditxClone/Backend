import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import type { MessageIdListDto } from '../message/dto';
import type { Message } from '../message/message.schema';
import type { User } from '../user/user.schema';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { PaginationParamsDto } from '../utils/apiFeatures/dto';

//type notification type ['private_msg', 'comment_reply','post_reply','post_vote','comment_vote','follow','mention']

/**
 * Service for notifications received by user
 */
@Injectable()
export class NotificationService {
  /**
   * Class constructor
   * @param notificationModel mongoose model
   * @param userModel mongoose model
   * @param messageModel mongoose model
   * @param apiFeaturesService api features service
   */
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
    @InjectModel('User')
    private readonly userModel: Model<User>,
    @InjectModel('Message')
    private readonly messageModel: Model<Message>,
    private readonly apiFeaturesService: ApiFeaturesService,
  ) {}

  /**
   * don't notify based on user's prefs
   * @param userId the request user id
   * @returns booleans of the prefs
   */
  skipNotify = async (userId: Types.ObjectId) => {
    const userNotifications = await this.userModel.findById(userId);

    if (!userNotifications) {
      throw new BadRequestException('User not found');
    }

    const {
      commentsOnPost,
      upvotePosts,
      upvoteComments,
      repliesComments,
      newFollowers,
    } = userNotifications;

    return {
      commentsOnPost,
      upvotePosts,
      upvoteComments,
      repliesComments,
      newFollowers,
    };
  };

  /**
   * counts number of new notifications
   * @param userId user id
   * @returns object: {count: 1}
   */
  countNew = async (userId: Types.ObjectId, username: string) => {
    const [countRes] = await this.notificationModel.aggregate([
      { $match: { userId, hidden: false, new: true } },
      { $count: 'count' },
    ]);

    const count: number = countRes?.count ?? 0;

    const [messageCountRes] = await this.messageModel.aggregate([
      {
        $match: {
          destName: username,
          isRead: false,
        },
      },
      { $count: 'count' },
    ]);

    const messageCount: number = messageCountRes?.count ?? 0;

    return { count, messageCount, total: count + messageCount };
  };

  /**
   * retrieve all notifications for the user
   * @param userId the user id
   * @returns all user's notification
   */
  findAll = async (
    userId: Types.ObjectId,
    paginationParams: PaginationParamsDto,
  ) => {
    const res = this.notificationModel.aggregate([
      { $match: { userId, hidden: false } },
      {
        $lookup: {
          from: 'users',
          localField: 'notifierId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'subreddits',
          localField: 'notifierId',
          foreignField: '_id',
          as: 'subreddit',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$subreddit',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          refId: 1,
          body: 1,
          type: 1,
          createdAt: 1,
          read: 1,
          new: 1,
          userPhoto: '$user.profilePhoto',
          subredditPhoto: '$subreddit.icon',
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    const awaitedRes =
      await this.apiFeaturesService.getPaginatedResponseFromAggregate(
        res,
        paginationParams,
      );
    await this.notificationModel.updateMany({ userId }, { new: false });

    return awaitedRes;
  };

  /**
   * Notify a user with a specific notification
   * @param userId the user to be notified
   * @param refId the reference object id
   * @param notifierId the user who generated the notification
   * @param followerName the follower name
   */
  notifyOnFollow = async (
    userId: Types.ObjectId,
    refId: Types.ObjectId,
    notifierId: Types.ObjectId,
    followerName: string,
  ) => {
    const { newFollowers } = await this.skipNotify(userId);

    //if user turned off notifications on new followers
    if (!newFollowers) {
      return {};
    }

    let body = '';

    body = `u/${followerName} started following you.`;

    return this.notificationModel.findOneAndUpdate(
      {
        userId,
        body,
      },
      {
        userId,
        body,
        refId,
        type: 'follow',
        notifierId,
      },
      { upsert: true, returnOriginal: false },
    );
  };

  /**
   * Notify a user with a specific notification
   * @param userId the user to be notified
   * @param refId the reference object id
   * @param type post or comment
   * @param subredditName subreddit name
   * @param notifierId the subreddit which generated the notification
   */
  notifyOnVotes = async (
    userId: Types.ObjectId,
    refId: Types.ObjectId,
    type: string,
    subredditName: string,
    notifierId: Types.ObjectId,
  ) => {
    let body = '';

    const refType = type.toLowerCase();
    const { upvotePosts, upvoteComments } = await this.skipNotify(userId);

    //if user turned off notifications on posts or comments votes
    if (
      (refType === 'post' && !upvotePosts) ||
      (refType === 'comment' && !upvoteComments)
    ) {
      return {};
    }

    body = `You got an upvote on your ${refType} in r/${subredditName}`;

    return this.notificationModel.findOneAndUpdate(
      {
        userId,
        body,
        refId,
      },
      {
        userId,
        body,
        refId,
        type: refType + '_vote',
        notifierId,
      },
      { upsert: true, returnOriginal: false },
    );
  };

  /**
   * Notify a user with a specific notification
   * @param userId the user to be notified
   * @param refId the reference object id
   * @param type post or comment
   * @param subredditName subreddit name
   * @param replierName The user who generated the notification
   * @param notifierId the user who is replying
   */
  notifyOnReplies = async (
    userId: Types.ObjectId,
    refId: Types.ObjectId,
    type: string,
    subredditName: string,
    replierName: string,
    notifierId: Types.ObjectId,
  ) => {
    let body = '';

    const refType = type.toLowerCase();
    const { repliesComments, commentsOnPost } = await this.skipNotify(userId);

    //if user turned off notifications on posts or comments replies

    if (
      (refType === 'post' && !commentsOnPost) ||
      (refType === 'comment' && !repliesComments)
    ) {
      return {};
    }

    body = `u/${replierName} replied to your ${refType} in r/${subredditName}`;

    return this.notificationModel.create({
      userId,
      body,
      refId,
      type: refType + '_reply',
      notifierId,
    });
  };

  /**
   * Mark as hidden will not show again for the user
   * @param userId the user's id
   * @param notificationId  the notification id
   */
  hide = async (userId: Types.ObjectId, notificationId: Types.ObjectId) => {
    const info = await this.notificationModel.updateOne(
      { userId, _id: notificationId },
      { hidden: true },
    );

    if (info.matchedCount === 0) {
      throw new BadRequestException(
        `Your notification Id is either invalid or you are trying to hide someone else's notifications`,
      );
    }

    return {
      modifiedCount: info.modifiedCount,
      status: 'success',
      timestamp: new Date(),
    };
  };

  /**
   * Mark as read will show again but not highlighted for the user
   * @param userId the user's id
   * @param messageIdList  the notifications ids
   */
  markAsRead = async (
    userId: Types.ObjectId,
    messageIdList: MessageIdListDto,
  ) => {
    const { messages } = messageIdList;

    const info = await this.notificationModel.updateMany(
      { userId, _id: { $in: messages } },
      { read: true },
    );

    if (info.matchedCount === 0) {
      throw new BadRequestException(
        `Your notification Id is either invalid or you are trying to read someone else's notifications`,
      );
    }

    return {
      modifiedCount: info.modifiedCount,
      status: 'success',
      timestamp: new Date(),
    };
  };

  /**
   * Notify a user on username mention
   * @param username the user to be notified
   * @param refId the reference object id (postComment)
   * @param type post or comment
   * @param subredditName subreddit name
   * @param replierName the user who mentions the other user
   * @param notifierId the user who is mentioning
   */
  notifyOnUserMentions = async (
    username: string,
    refId: Types.ObjectId,
    type: string,
    subredditName: string,
    replierName: string,
    notifierId: Types.ObjectId,
  ) => {
    let body = '';

    const refType = type.toLowerCase();
    //get user id => this better be removed in future
    const userToBeMentioned: any = await this.userModel.findOne({
      username,
    });

    if (!userToBeMentioned) {
      return {};
    }

    const { _id: userId }: any = userToBeMentioned;
    const { repliesComments, commentsOnPost } = await this.skipNotify(userId);

    //if user turned off notifications on posts or comments replies

    if (
      (refType === 'post' && !commentsOnPost) ||
      (refType === 'comment' && !repliesComments)
    ) {
      return {};
    }

    body = `u/${replierName} mentioned you on a ${refType} in r/${subredditName}`;

    return this.notificationModel.findOneAndUpdate(
      {
        userId,
        body,
      },
      {
        userId,
        body,
        refId,
        type: 'mention',
        notifierId,
      },
      { upsert: true, returnOriginal: false },
    );
  };
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { MessageIdListDto } from 'message/dto';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';
import type { User } from 'user/user.schema';

import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { PaginationParamsDto } from '../utils/apiFeatures/dto';

//type notification type ['private_msg', 'comment_reply','post_reply','post_vote','comment_vote','follow',]

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
    @InjectModel('User')
    private readonly userModel: Model<User>,
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
  countNew = async (userId: Types.ObjectId) => {
    const [count] = await this.notificationModel.aggregate([
      { $match: { userId, hidden: false, new: true } },
      { $count: 'count' },
    ]);

    if (!count) {
      return { count: 0 };
    }

    return count;
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
          userPhoto: '$user.profilePhoto',
          subredditPhoto: '$subreddit.icon',
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    await this.notificationModel.updateMany({ userId }, { new: false });

    return this.apiFeaturesService.getPaginatedResponseFromAggregate(
      res,
      paginationParams,
    );
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
   * @param replierName
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
}

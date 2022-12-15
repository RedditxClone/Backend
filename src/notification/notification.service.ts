import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { PaginationParamsDto } from '../utils/apiFeatures/dto';

//type notification type ['private_msg', 'comment_reply','post_reply','post_vote','comment_vote','follow',]

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
    private readonly apiFeaturesService: ApiFeaturesService,
  ) {}

  /**
   * counts number of new notifications
   * @param userId user id
   * @returns object: {count: 1}
   */
  countNew = async (userId: Types.ObjectId) => {
    const [count] = await this.notificationModel.aggregate([
      { $match: { userId, hidden: false } },
      { $count: 'count' },
    ]);

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
      { $set: { new: false } },
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

    body = `You got an upvote on your ${refType} in r/${subredditName}`;

    return this.notificationModel.findOneAndUpdate(
      {
        userId,
        body,
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

    return { status: 'success', timestamp: new Date() };
  };
}

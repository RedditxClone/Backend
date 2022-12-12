import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

//type notification type ['private_msg', 'comment_reply','post_reply','post_vote','comment_vote','follow',]

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
  ) {}

  findAll() {
    return `This action returns all notification`;
  }

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

    body = `${followerName} started following you.`;

    await this.notificationModel.create({
      userId,
      body,
      refId,
      type: 'follow',
      notifierId,
    });
  };

  /**
   * Notify a user with a specific notification
   * @param userId the user to be notified
   * @param refId the reference object id
   * @param type post or comment
   * @param subredditName subreddit name
   */
  notifyOnVotes = async (
    userId: Types.ObjectId,
    refId: Types.ObjectId,
    type: string,
    subredditName: string,
  ) => {
    let body = '';

    const refType = type.toLowerCase();

    body = `You got an upvote on your ${refType} in r/${subredditName}`;

    await this.notificationModel.create({
      userId,
      body,
      refId,
      type: refType + '_vote',
    });
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
  ) => {
    let body = '';

    const refType = type.toLowerCase();

    body = `u/${replierName} replied to your ${refType} in r/${subredditName}`;

    await this.notificationModel.create({
      userId,
      body,
      refId,
      type: refType + '_reply',
    });
  };
}

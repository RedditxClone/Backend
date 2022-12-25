import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import type { PipelineStage, Types } from 'mongoose';
import { Model } from 'mongoose';

import { BlockService } from '../block/block.service';
import type { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { PaginationParamsDto } from '../utils/apiFeatures/dto';
import type { MessageReplyDto, ModifiedCountDto } from './dto';
import { MessageReturnDto } from './dto';
import type { CreateMessageDto } from './dto/create-message.dto';
import type { MessageIdListDto } from './dto/message-id-list.dto';
import type { Message, MessageDocument } from './message.schema';

/**
 * Service for messaging between users
 */
@Injectable()
export class MessageService {
  /**
   * Class Constructor
   * @param messageModel mongoose model
   * @param blockService block service
   * @param userService user service
   * @param apiFeaturesService api feature service
   */
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    private readonly blockService: BlockService,
    private readonly userService: UserService,
    private readonly apiFeaturesService: ApiFeaturesService,
  ) {}

  /**
   * Check if it is possible that a user can send a message to
   * another user
   * @param authorName Username of sending user
   * @param authorId MongoId of sending user
   * @param destName Username of receiving user
   * @param destId MongoId of receiving user
   * @throws ForbiddenException if cannot send message
   */
  private async canSendMessage(
    authorName: string,
    authorId: Types.ObjectId,
    destName: string,
    destId: Types.ObjectId,
  ): Promise<void> {
    if (await this.blockService.existBlockBetween(authorId, destId)) {
      throw new ForbiddenException(
        `Cannot send message due to a block between you and ${destName}`,
      );
    }

    if (!(await this.userService.canRecieveMessages(destId, authorName))) {
      throw new ForbiddenException(
        `User ${destName} does not accept private messages`,
      );
    }
  }

  /**
   * Send private message to another user
   * @param createMessageDto Message information
   * @param authorName Username of sending user
   * @param authorId MongoId of sending user
   * @param destName Username of receiving user
   * @throws NotFoundException if no user exists
   * @throws ForbiddenException if cannot send message
   * @returns sent message
   */
  async sendPrivateMessage(
    createMessageDto: CreateMessageDto,
    authorName: string,
    authorId: Types.ObjectId,
    destName: string,
  ): Promise<MessageReturnDto> {
    // throws NotFoundException if no user exists
    const destUser: UserDocument = await this.userService.getUserByUsername(
      destName,
    );

    // throws ForbiddenException if cannot send message
    await this.canSendMessage(authorName, authorId, destName, destUser._id);

    const returnedMessage: MessageDocument = await this.messageModel.create({
      authorName,
      destName,
      ...createMessageDto,
    });

    return plainToInstance(MessageReturnDto, returnedMessage);
  }

  /**
   * Reply to an existing private message
   * @param messageReplyDto Message information
   * @param authorName Username of sending user
   * @param authorId MongoId of sending user
   * @param parentId MongoId of parent message
   * @throws NotFoundException if no user or no message exists
   * @throws ForbiddenException if cannot send message
   * @returns sent message
   */
  async replyToPrivateMessage(
    messageReplyDto: MessageReplyDto,
    authorName: string,
    authorId: Types.ObjectId,
    parentId: Types.ObjectId,
  ): Promise<MessageReturnDto> {
    const message: MessageDocument | null | undefined =
      await this.messageModel.findOne({
        _id: parentId,
        destName: authorName, // parent message dest is current author
        softDeleted: false,
      });

    if (!message) {
      throw new NotFoundException(
        'Either message is not found or cannot reply to this message',
      );
    }

    const destUser: UserDocument = await this.userService.getUserByUsername(
      message.authorName, // parent message author is current dest
    );

    // throws ForbiddenException if cannot send message
    await this.canSendMessage(
      authorName,
      authorId,
      destUser.username,
      destUser._id,
    );

    // add re to the begining of subject
    const subject = message.subject.startsWith('re: ')
      ? message.subject
      : 're: ' + message.subject;

    // is this parent not root of conversation ?
    const firstMessageId = message.firstMessageId ?? parentId;

    const returnedMessage: MessageDocument = await this.messageModel.create({
      authorName,
      destName: destUser.username,
      firstMessageId,
      subject,
      parentId,
      ...messageReplyDto,
    });

    return plainToInstance(MessageReturnDto, returnedMessage);
  }

  /**
   * Delete a received message
   * @param authorName Username of sending user
   * @param messageId MongoId of message
   * @throws NotFoundException: no message exists
   * @returns status: success
   */
  async delete(authorName: string, messageId: Types.ObjectId) {
    const findFilter = {
      _id: messageId,
      destName: authorName,
      softDeleted: false,
    }; // only delete received messages
    const updateFilter = { softDeleted: true };
    const message = await this.messageModel.findOneAndUpdate(
      findFilter,
      updateFilter,
    );

    if (!message) {
      throw new NotFoundException(
        'Message is not found or cannot delete this message',
      );
    }

    return { status: 'success' };
  }

  /**
   * Mark a list of messages as read
   * @param username Username of user
   * @param messageIdList List of message MongoIds
   * @returns count of messages marked as read
   */
  async markAsRead(
    username: string,
    messageIdList: MessageIdListDto,
  ): Promise<ModifiedCountDto> {
    const { messages } = messageIdList;
    const res = await this.messageModel.updateMany(
      { destName: username, isRead: false, _id: { $in: messages } },
      { isRead: true },
    );

    return { modifiedCount: res.modifiedCount };
  }

  /**
   * Mark a list of messages as unread
   * @param username Username of user
   * @param messageIdList List of message MongoIds
   * @returns count of messages marked as unread
   */
  async markAsUnRead(
    username: string,
    messageIdList: MessageIdListDto,
  ): Promise<ModifiedCountDto> {
    const { messages } = messageIdList;
    const res = await this.messageModel.updateMany(
      { destName: username, isRead: true, _id: { $in: messages } },
      { isRead: false },
    );

    return { modifiedCount: res.modifiedCount };
  }

  /**
   * Generate a message based on a post or comment reply
   * @param authorName Username of sending user
   * @param destName Username of receiveing user
   * @param title Title of message
   * @param body Body of message
   * @param postCommentId MongoId of comment
   * @param type Reply typle: 'post' | 'comment'
   * @param subreddit Name of subreddit containing comment
   * @returns Generated message
   */
  async messageOnReplies(
    authorName: string,
    destName: string,
    title: string,
    body: string,
    postCommentId: Types.ObjectId,
    type: string,
    subreddit: string,
  ) {
    const subject = type + ' reply: ' + title;
    type += '_reply';

    return this.messageModel.create({
      authorName,
      destName,
      subject,
      body,
      postCommentId,
      type,
      subreddit,
    });
  }

  /**
   * Get all messages of a specific user with an optional filter
   * @param username Username of user
   * @param paginationParams Limit and Offset of pagination
   * @param type Filtering type
   * @returns List of messages based on pagination and filtering
   */
  async findAll(
    username: string,
    paginationParams: PaginationParamsDto,
    type?: 'msg' | 'post' | 'comment' | 'unread' | 'sent',
  ) {
    let matchStage: PipelineStage;

    switch (type) {
      case 'msg': {
        matchStage = {
          $match: {
            type: { $eq: 'private_msg' },
            $or: [
              {
                authorName: username,
                softDeleted: false,
              },
              {
                destName: username,
              },
            ],
          },
        };
        break;
      }

      case 'unread': {
        matchStage = {
          $match: {
            destName: username,
            isRead: false,
          },
        };
        break;
      }

      case 'post': {
        matchStage = {
          $match: {
            destName: username,
            type: { $eq: 'post_reply' },
          },
        };
        break;
      }

      case 'comment': {
        matchStage = {
          $match: {
            destName: username,
            type: { $eq: 'comment_reply' },
          },
        };
        break;
      }

      case 'sent': {
        matchStage = {
          $match: {
            authorName: username,
            softDeleted: false,
            type: { $eq: 'private_msg' },
          },
        };
        break;
      }

      default: {
        matchStage = {
          $match: {
            $or: [
              {
                authorName: username,
                softDeleted: false,
                type: { $eq: 'private_msg' },
              },
              {
                destName: username,
              },
            ],
          },
        };
      }
    }

    const findAllAggregate = this.messageModel.aggregate([
      matchStage,
      {
        $addFields: {
          firstMessageId: {
            $ifNull: ['$firstMessageId', '$_id'],
          },
        },
      },
      {
        $lookup: {
          from: 'postcomments',
          localField: 'postCommentId',
          foreignField: '_id',
          as: 'post',
        },
      },
      {
        $lookup: {
          from: 'postcomments',
          localField: 'post.postId',
          foreignField: '_id',
          as: 'post',
        },
      },
      {
        $unwind: {
          path: '$post',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          commentCount: { $ifNull: ['$post.commentCount', 0] },
        },
      },
      {
        $project: {
          post: 0,
          __v: 0,
          softDeleted: 0,
          spammed: 0,
        },
      },
      {
        $group: {
          _id: '$firstMessageId',
          messages: {
            $push: '$$CURRENT',
          },
        },
      },
      {
        $sort: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'messages.createdAt': -1,
        },
      },
    ]);

    return this.apiFeaturesService.getPaginatedResponseFromAggregate(
      findAllAggregate,
      paginationParams,
    );
  }

  /**
   * Find a specific message
   * @param username Username of user
   * @param messageId MongoId of message
   * @returns Message
   */
  async findOne(
    username: string,
    messageId: Types.ObjectId,
  ): Promise<MessageReturnDto> {
    const message: MessageDocument | null = await this.messageModel.findById(
      messageId,
    );

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (
      (message.authorName !== username || message.softDeleted === true) &&
      message.destName !== username
    ) {
      throw new ForbiddenException('You are not allowed to view this message');
    }

    return plainToInstance(MessageReturnDto, message);
  }

  /**
   * Mark a message as spam
   * @param username Username of user
   * @param messageId MongoId of message
   * @returns status: success
   */
  async spam(username: string, messageId: Types.ObjectId) {
    const findFilter = {
      _id: messageId,
      destName: username,
      softDeleted: false,
    }; // only spam received messages
    const updateFilter = { spammed: true };
    const message = await this.messageModel.findOneAndUpdate(
      findFilter,
      updateFilter,
    );

    if (!message) {
      throw new NotFoundException(
        'Message is not found or cannot spam this message',
      );
    }

    return { status: 'success' };
  }
}

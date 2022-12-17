import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MessageService } from '../message/message.service';
import { NotificationService } from '../notification/notification.service';
import type { Comment } from './comment.schema';
import type { CreateCommentDto, UpdateCommentDto } from './dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
    @InjectModel('PostComment')
    private readonly postCommentModel: Model<Comment>,
    private readonly notificationService: NotificationService,
    private readonly messageService: MessageService,
  ) {}

  /**
   * Create a Comment in a subreddit.
   * @param userId user's id whom is creating the Comment
   * @param createCommentDto encapsulating the create Comment data
   * @returns a promise of the Comment created
   * @throws BadRequestException when falling to create a Comment
   */
  create = async (
    username: string,
    userId: Types.ObjectId,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment & { _id: Types.ObjectId }> => {
    const parentId = new Types.ObjectId(createCommentDto.parentId);
    const postId = new Types.ObjectId(createCommentDto.postId);
    const subredditId = new Types.ObjectId(createCommentDto.subredditId);
    const comment: Comment & { _id: Types.ObjectId } =
      await this.commentModel.create({
        userId,
        ...createCommentDto,
        postId,
        parentId,
        subredditId,
      });

    //notification
    const [info] = await this.postCommentModel.aggregate([
      { $match: { _id: parentId } },
      {
        $lookup: {
          from: 'subreddits',
          localField: 'subredditId',
          foreignField: '_id',
          as: 'subreddit',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
    ]);
    let replyType = 'comment';

    if (postId.equals(parentId)) {
      replyType = 'post';
    }

    if (
      info !== undefined &&
      !info.userId.equals(userId) &&
      !info.user[0].dontNotifyIds.includes(parentId) &&
      !info.user[0].dontNotifyIds.includes(postId)
    ) {
      await this.notificationService.notifyOnReplies(
        info.userId,
        userId,
        replyType,
        info.subreddit[0].name,
        info.user[0].username,
        info.user[0]._id,
      );

      await this.messageService.messageOnReplies(
        username,
        info.user.username,
        info.title,
        comment.text,
        comment._id,
        replyType,
      );
    }

    return comment;
  };

  findAll() {
    return `This action returns all comment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, _updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}

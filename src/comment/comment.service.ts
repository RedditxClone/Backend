import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MessageService } from '../message/message.service';
import { NotificationService } from '../notification/notification.service';
import { PostService } from '../post/post.service';
import type { Comment } from './comment.schema';
import type { CreateCommentDto } from './dto';
/**
 * comment module service
 */
@Injectable()
export class CommentService {
  /**
   * class constructor
   * @param commentModel comment model
   * @param postCommentModel postComment model
   * @param notificationService NotificationService
   * @param postService PostService
   * @param messageService MessageService
   */
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
    @InjectModel('PostComment')
    private readonly postCommentModel: Model<Comment>,
    private readonly notificationService: NotificationService,
    private readonly postService: PostService,
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
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ): Promise<Comment & { _id: Types.ObjectId }> => {
    const parentId = new Types.ObjectId(createCommentDto.parentId);
    const postId = new Types.ObjectId(createCommentDto.postId);
    const subredditId = new Types.ObjectId(createCommentDto.subredditId);
    const incremented = await this.postService.addToComments(
      postId,
      subredditId,
      1,
    );

    if (!incremented) {
      throw new NotFoundException(
        `there is no such a post in the subreddit with id ${subredditId}`,
      );
    }

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
      {
        $lookup: {
          from: 'postcomments',
          localField: 'postId',
          foreignField: '_id',
          as: 'post',
        },
      },
    ]);
    let replyType = 'comment';

    if (postId.equals(parentId)) {
      replyType = 'post';
    }

    if (
      info !== undefined &&
      !info.userId?.equals(userId) &&
      !info.user[0]?.dontNotifyIds?.includes(parentId) &&
      !info.user[0]?.dontNotifyIds?.includes(postId)
    ) {
      await this.notificationService.notifyOnReplies(
        info.user[0]._id,
        comment._id,
        replyType,
        info.subreddit[0].name,
        username,
        userId,
      );

      await this.messageService.messageOnReplies(
        username,
        info.user[0].username,
        info.title || info.post[0].title,
        comment.text,
        comment._id,
        replyType,
        info.subreddit[0].name,
      );
      // if the user didn't receive a post or comment notification check if he was mentioned then notify him
      const usernameMentions: string[] = [];
      // eslint-disable-next-line @typescript-eslint/ban-types
      const promises: Array<Promise<{}>> = [];
      //username mentions regex
      const regex = /(?<!\S)(u\/[\da-z]*)(?!\S)/gim;
      const body = createCommentDto.text;
      //extract all mentions
      let m;

      do {
        m = regex.exec(body);

        if (m) {
          usernameMentions.push(m[1].slice(2));
        }
      } while (m);

      for (const name of usernameMentions) {
        // if got already a notification for a comment or I am mentioning my self
        if (name !== username && name !== info.user[0].username) {
          promises.push(
            this.notificationService.notifyOnUserMentions(
              name,
              comment._id,
              replyType,
              info.subreddit[0].name,
              username,
              userId,
            ),
          );
        }
      }

      //await on all promises
      await Promise.all(promises);
    }

    return comment;
  };
}

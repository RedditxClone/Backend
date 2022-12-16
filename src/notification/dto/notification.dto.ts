import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class GetNotificationDto {
  @ApiProperty({ description: 'the user who replied/followed' })
  notifierId: Types.ObjectId;

  @ApiProperty({
    description: 'The notification type',
    enum: [
      'comment_reply',
      'post_reply',
      'post_vote', // upvote on post
      'comment_vote', // upvote on comment
      'follow', // user follow
    ],
  })
  type: string;

  //can ba a message or post/comment
  @ApiProperty({
    description:
      'If the notification is Message or PostComment this will have the Message or PostComment id',
  })
  refId: Types.ObjectId;

  @ApiProperty({ description: 'Notification text' })
  body: string;

  @ApiProperty({ description: 'The date of creation' })
  createdAt: Date;

  @ApiProperty({ description: 'Notification is not read' })
  read: boolean;
}

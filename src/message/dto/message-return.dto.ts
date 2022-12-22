import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Types } from 'mongoose';

import { ExposeId } from '../../utils/decorators/expose-id.decorator';

@Exclude()
export class MessageReturnDto {
  @ExposeId()
  @Expose()
  @ApiProperty({ type: String, nullable: true })
  firstMessageId: Types.ObjectId | null;

  @ExposeId()
  @Expose()
  @ApiProperty({ type: String, nullable: true })
  parentId: Types.ObjectId | null;

  @Expose()
  authorName: string;

  @Expose()
  destName: string;

  @Expose()
  subject: string;

  @Expose()
  body: string;

  @Expose()
  createdAt: Date;

  @Expose()
  isRead: boolean;

  @Expose()
  @ApiProperty({
    enum: ['private_msg', 'comment_reply', 'post_reply'],
  })
  type: string;

  @ExposeId()
  @Expose()
  @ApiProperty({ type: String, nullable: true })
  postCommentId: Types.ObjectId | null;

  @Expose()
  subreddit: string;

  @ExposeId()
  @Expose()
  @ApiProperty({ type: String })
  _id: Types.ObjectId;
}

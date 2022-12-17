import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';
import type { UserDocument } from 'user/user.schema';

import { BlockService } from '../block/block.service';
import { UserService } from '../user/user.service';
import type { MessageReplyDto, ModifiedCountDto } from './dto';
import { MessageReturnDto } from './dto';
import type { CreateMessageDto } from './dto/create-message.dto';
import type { MessageIdListDto } from './dto/message-id-list.dto';
import type { Message, MessageDocument } from './message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    private readonly blockService: BlockService,
    private readonly userService: UserService,
  ) {}

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

  async delete(authorName: string, messageId: Types.ObjectId) {
    const findFilter = {
      _id: messageId,
      destName: authorName,
      softDeleted: false,
    }; // only delete recieved messages
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

  async messageOnReplies(
    authorName: string,
    destName: string,
    title: string,
    body: string,
    postCommentId: Types.ObjectId,
    type: string,
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
    });
  }

  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }
}

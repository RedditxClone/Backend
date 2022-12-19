import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { Types } from 'mongoose';

import { BlockModule } from '../block/block.module';
import { stubUser } from '../user/test/stubs/user.stub';
import { UserModule } from '../user/user.module';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { PaginationParamsDto } from '../utils/apiFeatures/dto';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import type { CreateMessageDto, MessageReplyDto } from './dto';
import { MessageReturnDto } from './dto';
import { MessageSchema } from './message.schema';
import { MessageService } from './message.service';

jest.mock('../user/user.service');
jest.mock('../block/block.service');

describe('MessageService', () => {
  let service: MessageService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        UserModule,
        BlockModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
      ],
      providers: [MessageService, ApiFeaturesService],
    }).compile();
    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  let message: MessageReturnDto;
  const id = new Types.ObjectId(123);

  describe('sendPrivateMessage', () => {
    it('should create message successfully', async () => {
      const user = stubUser();
      const authorName = 'authorUser';
      const destName = user.username;
      const createMessageDto: CreateMessageDto = {
        subject: 'Some subject',
        body: 'some body',
      };
      const returnMessage: MessageReturnDto = await service.sendPrivateMessage(
        createMessageDto,
        authorName,
        id,
        destName,
      );
      expect(returnMessage).toEqual(
        expect.objectContaining({ authorName, destName, ...createMessageDto }),
      );

      message = returnMessage;
    });
  });

  let parentId: Types.ObjectId;
  let parentId2: Types.ObjectId;

  describe('replyToPrivateMessage', () => {
    const messageReplyDto: MessageReplyDto = {
      body: 'some reply body',
    };
    it('should throw error', async () => {
      await expect(async () => {
        await service.replyToPrivateMessage(
          messageReplyDto,
          message.authorName, // user cannot reply to his own message
          id,
          message._id,
        );
      }).rejects.toThrowError(NotFoundException);
    });

    it('should throw error', async () => {
      await expect(async () => {
        await service.replyToPrivateMessage(
          messageReplyDto,
          message.authorName,
          id,
          new Types.ObjectId(56), // id not found
        );
      }).rejects.toThrowError(NotFoundException);
    });

    it('should reply successfully', async () => {
      const returnMessage: MessageReturnDto =
        await service.replyToPrivateMessage(
          messageReplyDto,
          message.destName,
          id,
          message._id,
        );
      parentId = returnMessage._id;
      expect(returnMessage).toEqual(
        expect.objectContaining({
          authorName: message.destName,
          destName: message.authorName,
          subject: 're: ' + message.subject,
          ...messageReplyDto,
        }),
      );
    });

    it('should reply successfully', async () => {
      const replyToReply: MessageReplyDto = { body: 'different body' };
      const returnMessage: MessageReturnDto =
        await service.replyToPrivateMessage(
          replyToReply,
          message.authorName,
          id,
          parentId,
        );
      parentId2 = returnMessage._id;
      expect(returnMessage).toEqual(
        expect.objectContaining({
          firstMessageId: message._id, // root
          parentId, // parent
          authorName: message.authorName,
          destName: message.destName,
          subject: 're: ' + message.subject,
          ...replyToReply,
        }),
      );
    });
  });

  describe('spam', () => {
    it('should throw error', async () => {
      await expect(async () => {
        await service.spam(message.authorName, message._id);
      }).rejects.toThrowError(NotFoundException);
    });

    it('should throw error', async () => {
      await expect(async () => {
        await service.spam(message.authorName, new Types.ObjectId(123));
      }).rejects.toThrowError(NotFoundException);
    });

    it('should spam successfully', async () => {
      expect(await service.spam(message.destName, message._id)).toEqual({
        status: 'success',
      });
    });
  });

  describe('delete', () => {
    it('should throw error', async () => {
      await expect(async () => {
        await service.delete(message.authorName, message._id);
      }).rejects.toThrowError(NotFoundException);
    });

    it('should throw error', async () => {
      await expect(async () => {
        await service.delete(message.authorName, new Types.ObjectId(123));
      }).rejects.toThrowError(NotFoundException);
    });

    it('should delete successfully', async () => {
      expect(await service.delete(message.destName, message._id)).toEqual({
        status: 'success',
      });
    });
  });

  describe('markAsRead/Unread', () => {
    it('should not modify any', async () => {
      const a = new Types.ObjectId(456);
      const b = new Types.ObjectId(455);

      const messages = [a, b];
      const { modifiedCount } = await service.markAsRead(message.destName, {
        messages,
      });

      expect(modifiedCount).toBe(0);
    });

    it('should modify one message', async () => {
      const a = message._id;
      const b = new Types.ObjectId(455);

      const messages = [a, b];
      const { modifiedCount } = await service.markAsRead(message.destName, {
        messages,
      });

      expect(modifiedCount).toBe(1);
    });

    it('should modify one message', async () => {
      const a = message._id;
      const b = parentId2;

      const messages = [a, b];
      const { modifiedCount } = await service.markAsRead(message.destName, {
        messages,
      });

      expect(modifiedCount).toBe(1);
    });

    it('should modify two messages', async () => {
      const a = message._id;
      const b = parentId2;

      const messages = [a, b];
      const { modifiedCount } = await service.markAsUnRead(message.destName, {
        messages,
      });

      expect(modifiedCount).toBe(2);
    });

    it('should not modify any', async () => {
      const a = message._id;
      const b = parentId2;

      const messages = [a, b];
      const { modifiedCount } = await service.markAsUnRead(message.destName, {
        messages,
      });

      expect(modifiedCount).toBe(0);
    });

    it('should not modify any', async () => {
      const a = message._id;
      const b = new Types.ObjectId(455);

      const messages = [a, b];
      const { modifiedCount } = await service.markAsUnRead(message.destName, {
        messages,
      });

      expect(modifiedCount).toBe(0);
    });
  });

  describe('messageOnReplies', () => {
    const user = stubUser();
    const authorName = 'authorUser';
    const destName = user.username;
    const body = 'a body reply';
    const title = 'post title';
    const subreddit = 'srname';
    it('should generate message from comment successfully', async () => {
      const postCommentId = new Types.ObjectId(56_799);
      const returnMessage: MessageReturnDto = await service.messageOnReplies(
        authorName,
        destName,
        title,
        body,
        postCommentId,
        'comment',
        subreddit,
      );
      const subject = 'comment reply: ' + title;
      expect(returnMessage).toEqual(
        expect.objectContaining({
          authorName,
          destName,
          body,
          subject,
          postCommentId,
          type: 'comment_reply',
          subreddit,
        }),
      );
    });

    it('should generate message from post successfully', async () => {
      const postCommentId = new Types.ObjectId(56_800);
      const returnMessage: MessageReturnDto = await service.messageOnReplies(
        authorName,
        destName,
        title,
        body,
        postCommentId,
        'post',
        subreddit,
      );
      const subject = 'post reply: ' + title;
      expect(returnMessage).toEqual(
        expect.objectContaining({
          authorName,
          destName,
          body,
          subject,
          postCommentId,
          type: 'post_reply',
          subreddit,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw not found error', async () => {
      await expect(async () => {
        await service.findOne(message.authorName, new Types.ObjectId(123));
      }).rejects.toThrowError(NotFoundException);
    });

    it('should throw forbidden error', async () => {
      await expect(async () => {
        await service.findOne('NotAuthor', message._id);
      }).rejects.toThrowError(ForbiddenException);
    });

    it('should throw forbidden error', async () => {
      await expect(async () => {
        await service.findOne(message.authorName, message._id);
      }).rejects.toThrowError(ForbiddenException);
    });

    it('should find successfully', async () => {
      expect(await service.findOne(message.destName, message._id)).toEqual(
        plainToInstance(MessageReturnDto, message),
      );
    });
  });

  const paginationParams: PaginationParamsDto = {
    limit: 15,
    page: 1,
    sort: 'new',
  };

  describe('findAll', () => {
    it('should find all', async () => {
      const response = await service.findAll(
        message.destName,
        paginationParams,
      );
      const messages: any[] = [];

      for (const listing of response.data) {
        for (const msg of listing.messages) {
          messages.push(msg);
        }
      }

      expect(messages).toHaveLength(5);
    });

    it('should find unread', async () => {
      const response = await service.findAll(
        message.destName,
        paginationParams,
        'unread',
      );
      const messages: any[] = [];

      for (const listing of response.data) {
        for (const msg of listing.messages) {
          messages.push(msg);
        }
      }

      expect(messages).toHaveLength(4);
    });
  });

  describe('findAll', () => {
    it('should find comment', async () => {
      const response = await service.findAll(
        message.destName,
        paginationParams,
        'comment',
      );
      const messages: any[] = [];

      for (const listing of response.data) {
        for (const msg of listing.messages) {
          messages.push(msg);
        }
      }

      expect(messages).toHaveLength(1);

      for (const msg of messages) {
        expect(msg.type).toBe('comment_reply');
      }
    });
  });

  describe('findAll', () => {
    it('should find sent', async () => {
      const response = await service.findAll(
        message.destName,
        paginationParams,
        'sent',
      );
      const messages: any[] = [];

      for (const listing of response.data) {
        for (const msg of listing.messages) {
          messages.push(msg);
        }
      }

      expect(messages).toHaveLength(1);

      for (const msg of messages) {
        expect(msg.type).toBe('private_msg');
      }
    });

    it('should find post', async () => {
      const response = await service.findAll(
        message.destName,
        paginationParams,
        'post',
      );
      const messages: any[] = [];

      for (const listing of response.data) {
        for (const msg of listing.messages) {
          messages.push(msg);
        }
      }

      expect(messages).toHaveLength(1);

      for (const msg of messages) {
        expect(msg.type).toBe('post_reply');
      }
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { BlockModule } from '../block/block.module';
import { stubUser } from '../user/test/stubs/user.stub';
import { UserModule } from '../user/user.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import type {
  CreateMessageDto,
  MessageReplyDto,
  MessageReturnDto,
} from './dto';
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
      providers: [MessageService],
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

    let parentId: Types.ObjectId;
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

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

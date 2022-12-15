import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { PaginationParamsDto } from '../utils/apiFeatures/dto';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { NotificationModule } from './notification.module';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let module: TestingModule;
  const id2 = new Types.ObjectId(2);
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [NotificationModule, rootMongooseTestModule()],
      providers: [],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    await service.notifyOnReplies(id2, id2, 'post', 'folan1', 'folan2', id2);
    await service.notifyOnVotes(id2, id2, 'post', 'folan1', id2);
    await service.notifyOnFollow(id2, id2, id2, 'folan1');
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('notifyOnFollow spec', () => {
    const id = new Types.ObjectId(1);
    it('should pass', async () => {
      const res: any = await service.notifyOnFollow(id, id, id, 'folan');
      expect(res.body).toEqual('u/folan started following you.');
      expect(res.type).toEqual('follow');
    });
  });
  describe('notifyOnVotes spec', () => {
    const id = new Types.ObjectId(1);
    it('should pass', async () => {
      const res: any = await service.notifyOnVotes(id, id, 'post', 'folan', id);
      expect(res.body).toEqual('You got an upvote on your post in r/folan');
      expect(res.type).toEqual('post_vote');
    });
    it('should pass', async () => {
      const res: any = await service.notifyOnVotes(
        id,
        id,
        'comment',
        'folan',
        id,
      );
      expect(res.body).toEqual('You got an upvote on your comment in r/folan');
      expect(res.type).toEqual('comment_vote');
    });
  });
  describe('notifyOnReplies spec', () => {
    const id = new Types.ObjectId(1);
    it('should pass', async () => {
      const res: any = await service.notifyOnReplies(
        id,
        id,
        'post',
        'folan1',
        'folan2',
        id,
      );
      expect(res.body).toEqual('u/folan2 replied to your post in r/folan1');
      expect(res.type).toEqual('post_reply');
    });
    it('should pass', async () => {
      const res: any = await service.notifyOnReplies(
        id,
        id,
        'comment',
        'folan1',
        'folan2',
        id,
      );
      expect(res.body).toEqual('u/folan2 replied to your comment in r/folan1');
      expect(res.type).toEqual('comment_reply');
    });
  });
  describe('notifyOnReplies spec', () => {
    const id = new Types.ObjectId(1);
    it('should pass', async () => {
      const res: any = await service.notifyOnReplies(
        id,
        id,
        'post',
        'folan1',
        'folan2',
        id,
      );
      expect(res.body).toEqual('u/folan2 replied to your post in r/folan1');
      expect(res.type).toEqual('post_reply');
    });
    it('should pass', async () => {
      const res: any = await service.notifyOnReplies(
        id,
        id,
        'comment',
        'folan1',
        'folan2',
        id,
      );
      expect(res.body).toEqual('u/folan2 replied to your comment in r/folan1');
      expect(res.type).toEqual('comment_reply');
    });
  });
  describe('get count spec', () => {
    it('should pass', async () => {
      const res = await service.countNew(id2);
      expect(res.count).toEqual(3);
    });
  });
  describe('get notifications spec', () => {
    it('should pass', async () => {
      const res = await service.findAll(id2, new PaginationParamsDto());
      expect(res.data.length).toEqual(3);
      expect(res.data[0].body).toEqual(
        'u/folan2 replied to your post in r/folan1',
      );
      expect(res.data[1].body).toEqual(
        'You got an upvote on your post in r/folan1',
      );
      expect(res.data[2].body).toEqual('u/folan1 started following you.');
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

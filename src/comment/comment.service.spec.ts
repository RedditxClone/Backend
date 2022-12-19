import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { MessageService } from '../message/message.service';
import { NotificationModule } from '../notification/notification.module';
import { PostSchema } from '../post/post.schema';
import { PostCommentSchema } from '../post-comment/post-comment.schema';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { CommentSchema } from './comment.schema';
import { CommentService } from './comment.service';
import type { CreateCommentDto } from './dto';
import { stubComment } from './test/stubs/comment.stubs';

jest.mock('../message/message.service.ts');
describe('CommentService', () => {
  let service: CommentService;
  let module: TestingModule;
  const commentDto: CreateCommentDto = {
    subredditId: new Types.ObjectId(1),
    postId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
    parentId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
    text: 'Hello World',
  };
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        NotificationModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          {
            name: 'PostComment',
            schema: PostCommentSchema,
            discriminators: [
              {
                name: 'Post',
                schema: PostSchema,
              },
              {
                name: 'Comment',
                schema: CommentSchema,
              },
            ],
          },
        ]),
      ],

      providers: [CommentService, MessageService],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create comment spec', () => {
    test('should create successfully', async () => {
      const userId = new Types.ObjectId('6363fba4ab2c2f94f3ac9f37');
      const username = 'usrname';
      const comment = await service.create(username, userId, commentDto);
      const expected = stubComment();
      expect(comment).toEqual(expect.objectContaining(expected));
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

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
describe('CommentService', () => {
  let service: CommentService;
  let module: TestingModule;
  const commentDto: CreateCommentDto = {
    postId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
    parentId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
    text: 'Hello World',
  };
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
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

      providers: [CommentService],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create comment spec', () => {
    test('should create successfully', async () => {
      const userId = new Types.ObjectId('6363fba4ab2c2f94f3ac9f37');
      const comment = await service.create(userId, commentDto);
      const expected = stubComment();
      expect(comment).toEqual(expect.objectContaining(expected));
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

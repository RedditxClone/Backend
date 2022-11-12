import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { CommentSchema } from '../comment/comment.schema';
import { PostSchema } from '../post/post.schema';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { PostCommentSchema } from './post-comment.schema';
import { PostCommentService } from './post-comment.service';

describe('PostCommentService', () => {
  let service: PostCommentService;
  let module: TestingModule;
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
      providers: [PostCommentService],
    }).compile();

    service = module.get<PostCommentService>(PostCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  beforeAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

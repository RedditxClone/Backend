import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { CommentSchema } from '../comment/comment.schema';
import { PostCommentSchema } from '../post-comment/post-comment.schema';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import type { CreatePostDto } from './dto';
import { PostSchema } from './post.schema';
import { PostService } from './post.service';
import { stubPost } from './test/stubs/post.stub';
describe('PostService', () => {
  let service: PostService;
  let module: TestingModule;
  const postDto: CreatePostDto = {
    subredditId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
    title: 'post1',
    text: 'Hello World',
    nsfw: false,
    spoiler: false,
    flairs: [new Types.ObjectId('6363fba4ab2c2f94f3ac9f37')],
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
      providers: [PostService],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create post spec', () => {
    test('should create successfully', async () => {
      const userId = new Types.ObjectId('6363fba4ab2c2f94f3ac9f37');
      const post = await service.create(userId, postDto);
      const expected = stubPost();
      expect(post).toEqual(expect.objectContaining(expected));
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

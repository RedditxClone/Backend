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
import { HideSchema } from './hide.schema';
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
    flair: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
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
          {
            name: 'Hide',
            schema: HideSchema,
          },
        ]),
      ],
      providers: [PostService],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  let id: Types.ObjectId;
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create post spec', () => {
    test('should create successfully', async () => {
      const userId = new Types.ObjectId('6363fba4ab2c2f94f3ac9f37');
      const post = await service.create(userId, postDto);
      id = post._id;
      const expected = stubPost();
      expect(post).toEqual(expect.objectContaining(expected));
    });
  });
  describe('upload media spec', () => {
    test('should upload successfully', () => {
      const files: Express.Multer.File[] = [];
      const res = service.uploadMedia(files);
      expect(res.status).toEqual('success');
    });
  });
  describe('hide', () => {
    const userId = new Types.ObjectId(1);
    it('should hide successfully', async () => {
      const res = await service.hide(id, userId);
      expect(res).toEqual({ status: 'success' });
    });
    it('should throw duplicate error', async () => {
      await expect(service.hide(id, userId)).rejects.toThrow('duplicate');
    });
    it('should unhide successfully', async () => {
      const res = await service.unhide(id, userId);
      expect(res).toEqual({ status: 'success' });
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

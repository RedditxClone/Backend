import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { PostCommentService } from '../post-comment/post-comment.service';
import { stubPostComment } from '../post-comment/test/stubs/post-comment.stub';
import { CreatePostDto } from './dto';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { stubPost } from './test/stubs/post.stub';

jest.mock('./post.service');
jest.mock('../post-comment/post-comment.service');
describe('PostController', () => {
  let controller: PostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [PostService, PostCommentService],
    }).compile();

    controller = module.get<PostController>(PostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create post', () => {
    it('should create successfully', async () => {
      const userId = new Types.ObjectId(123);
      const res = await controller.create(userId, new CreatePostDto());
      expect(res).toEqual(stubPost());
    });
  });
  describe('Upload Media', () => {
    it('should upload successfully', () => {
      const files: Express.Multer.File[] = [];
      const res = controller.uploadMedia(files);
      expect(res.status).toEqual('success');
    });
  });

  describe('update post', () => {
    it('should be updated successfully', async () => {
      const res = await controller.update(
        new Types.ObjectId(1),
        { text: 'new text' },
        new Types.ObjectId(1),
      );
      expect(res).toEqual(stubPostComment());
    });
  });
});

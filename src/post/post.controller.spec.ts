import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { createRequest } from 'node-mocks-http';

import { PostCommentService } from '../post-comment/post-comment.service';
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
      const req = createRequest();
      req.user = { id: '123' };
      const res = await controller.create(req, new CreatePostDto());
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
});

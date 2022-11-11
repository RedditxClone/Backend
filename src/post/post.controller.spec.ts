import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { createRequest } from 'node-mocks-http';

import { CreatePostDto } from './dto';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { stubPost } from './test/stubs/post.stub';

jest.mock('./post.service');
describe('PostController', () => {
  let controller: PostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [PostService],
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
});

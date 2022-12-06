import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { PostCommentController } from './post-comment.controller';
import { PostCommentService } from './post-comment.service';

jest.mock('./post-comment.service');
describe('PostCommentController', () => {
  let controller: PostCommentController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostCommentController],
      providers: [PostCommentService],
    }).compile();

    controller = module.get<PostCommentController>(PostCommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

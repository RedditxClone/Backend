import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { createRequest } from 'node-mocks-http';

import { PostCommentService } from '../post-comment/post-comment.service';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto';
import { stubComment } from './test/stubs/comment.stubs';

jest.mock('./comment.service');
jest.mock('../post-comment/post-comment.service');
describe('CommentController', () => {
  let controller: CommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [CommentService, PostCommentService],
    }).compile();

    controller = module.get<CommentController>(CommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create comment', () => {
    it('should create successfully', async () => {
      const req = createRequest();
      req.user = { id: '123' };
      const res = await controller.create(req, new CreateCommentDto());
      expect(res).toEqual(stubComment());
    });
  });
});

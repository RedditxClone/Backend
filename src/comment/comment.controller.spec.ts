import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { PostCommentService } from '../post-comment/post-comment.service';
import { stubPostComment } from '../post-comment/test/stubs/post-comment.stub';
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
      const userId = new Types.ObjectId(123);
      const username = 'usrname';
      const res = await controller.create(
        username,
        userId,
        new CreateCommentDto(),
      );
      expect(res).toEqual(stubComment());
    });
  });
  describe('update comment', () => {
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

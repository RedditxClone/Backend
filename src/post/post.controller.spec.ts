import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { PostController } from './post.controller';
import { PostService } from './post.service';

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
});

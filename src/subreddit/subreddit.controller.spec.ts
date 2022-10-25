import { Test, TestingModule } from '@nestjs/testing';
import { SubredditController } from './subreddit.controller';
import { SubredditService } from './subreddit.service';

describe('SubredditController', () => {
  let controller: SubredditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubredditController],
      providers: [SubredditService],
    }).compile();

    controller = module.get<SubredditController>(SubredditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SubredditController } from './subreddit.controller';
import { SubredditService } from './subreddit.service';

jest.mock('./subreddit.service');
describe('subredditControllerSpec', () => {
  let subredditController: SubredditController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // providers: [SubredditService],
      // controllers: [SubredditController],
    }).compile();
    //   const moduleRef: TestingModule = await Test.createTestingModule({
    //     controllers: [SubredditController],
    //     providers: [SubredditService],
    //   }).compile();
    //   subredditController =
    //     moduleRef.get<SubredditController>(SubredditController);
    //   // jest.clearAllMocks();
  });

  test('it should be defined', () => {
    //   // expect(subredditController).toBeDefined();
  });

  // describe('getUserByIdSpec', () => {
  //   test('it should return a user', async () => {
  //     const id: Types.ObjectId = new Types.ObjectId(1);
  //     const user: UserDocument = await userController.getUserById(id);
  //     expect(user).toEqual(stubUser());
  //   });
  // });
  // describe('follow', () => {
  //   test('it should follow successfully', async () => {
  //     const req = createRequest();
  //     const id: Types.ObjectId = new Types.ObjectId('exampleOfId1');
  //     req.user = { id };
  //     const res: any = await userController.followUser(id, req);
  //     expect(res).toEqual({ status: 'success' });
  //   });
  // });
  // describe('unfollow', () => {
  //   test('it should unfollow successfully', async () => {
  //     const req = createRequest();
  //     const id: Types.ObjectId = new Types.ObjectId('exampleOfId1');
  //     req.user = { id };
  //     const res: any = await userController.unfollowUser(id, req);
  //     expect(res).toEqual({ status: 'success' });
  //   });
  // });
});

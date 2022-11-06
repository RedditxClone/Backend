import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { CreateSubredditDto } from './dto/create-subreddit.dto';
import { FlairDto } from './dto/flair.dto';
import { UpdateSubredditDto } from './dto/update-subreddit.dto';
import { SubredditController } from './subreddit.controller';
import { SubredditService } from './subreddit.service';
import { stubSubreddit } from './test/stubs/subreddit.stub';
import { stubFlair } from './test/stubs/flair.stub';

jest.mock('./subreddit.service');
describe('subredditControllerSpec', () => {
  let subredditController: SubredditController;
  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [SubredditService],
      controllers: [SubredditController],
    }).compile();
    subredditController =
      moduleRef.get<SubredditController>(SubredditController);
    jest.clearAllMocks();
  });

  test('it should be defined', () => {
    expect(subredditController).toBeDefined();
  });
  describe('create', () => {
    test('it should create a subreddit', async () => {
      const subredditDto: CreateSubredditDto = {
        name: 'subreddit',
        type: 'strict',
        over18: false,
      };
      const subreddit = await subredditController.createSubreddit(subredditDto);
      expect(subreddit).toEqual(stubSubreddit());
    });
  });

  describe('findSubreddit', () => {
    test('it should return a subreddit', async () => {
      const id = new Types.ObjectId(1).toString();
      const subreddit = await subredditController.getSubreddit(id);
      expect(subreddit).toEqual(stubSubreddit());
    });
  });

  describe('updateSubreddit', () => {
    test('it should update a subreddit', async () => {
      const updatedFields: UpdateSubredditDto = {
        acceptFollowers: false,
        type: 'private',
      };
      const id = new Types.ObjectId(1).toString();
      const u_sr = await subredditController.updateSubreddit(id, updatedFields);
      expect(u_sr).toEqual({ status: 'success' });
    });
  });

  describe('createFlair', () => {
    test('it should create a flair', async () => {
      const flair: FlairDto = {
        text: 'welcome',
        backgroundColor: '000',
        textColor: 'fff',
      };
      const id = new Types.ObjectId(1).toString();
      const f_sr = await subredditController.createFlairlist(id, flair);
      expect(f_sr).toEqual({ flairList: [stubFlair()] });
    });
  });

  describe('getFlairlist', () => {
    test('it should create a flair', async () => {
      const id = new Types.ObjectId(1).toString();
      const f_sr = await subredditController.getFlairlist(id);
      expect(f_sr).toEqual({ flairList: [stubFlair()] });
    });
  });

  describe('deleteFlairById', () => {
    test('it should delete a flair', async () => {
      const id1 = new Types.ObjectId(1).toString();
      const id2 = new Types.ObjectId(1).toString();
      const f_sr = await subredditController.removeFlair(id1, id2);
      expect(f_sr).toEqual({ status: 'success' });
    });
  });

  describe('uploadIcon', () => {
    test('it should upload an icon', async () => {
      const id = new Types.ObjectId(1).toString();
      const file: File = null;
      const i1_sr = await subredditController.uploadIcon(id, file);
      expect(i1_sr).toEqual({ icon: '6365278228aa323e825cf55e.jpeg' });
    });
  });

  describe('removeIcon', () => {
    test('it should upload an icon', async () => {
      const id = new Types.ObjectId(1).toString();
      const i2_sr = await subredditController.removeIcon(id);
      expect(i2_sr).toEqual({ status: 'success' });
    });
  });
});

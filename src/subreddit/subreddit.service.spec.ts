import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { readFile } from 'fs/promises';
import mongoose from 'mongoose';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongooseInMemory';
import { CreateSubredditDto } from './dto/create-subreddit.dto';
import { FlairDto } from './dto/flair.dto';
import { UpdateSubredditDto } from './dto/update-subreddit.dto';
import { SubredditSchema } from './subreddit.schema';
import { SubredditService } from './subreddit.service';

describe('SubredditService', () => {
  let subredditService: SubredditService;
  let module: TestingModule;
  let id: string;

  const subredditDefault: CreateSubredditDto = {
    name: 'subredditDefault',
    type: 'public',
    over18: false,
  };

  const subreddit1: CreateSubredditDto = {
    name: 'subreddit1',
    type: 'strict',
    over18: true,
  };

  const defaultFields = {
    usersPermissions: 0,
    acceptPostingRequests: false,
    allowPostCrosspost: true,
    collapseDeletedComments: false,
    commentScoreHideMins: 0,
    archivePosts: false,
    allowMultipleImages: true,
    spoilersEnabled: true,
    suggestedCommentSort: 'None',
    acceptFollowers: true,
    allowImages: true,
    allowVideos: true,
    acceptingRequestsToJoin: true,
    requirePostFlair: false,
    postTextBodyRule: 0,
    restrictPostTitleLength: false,
    banPostBodyWords: false,
    banPostTitleWords: false,
    requireWordsInPostTitle: false,
    postGuidelines: '',
    welcomeMessageEnabled: false,
    flairList: [],
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'subreddit', schema: SubredditSchema },
        ]),
      ],
      providers: [SubredditService],
    }).compile();
    subredditService = module.get<SubredditService>(SubredditService);
    id = (await subredditService.create(subredditDefault))._id.toString();
  });

  it('should be defined', () => {
    expect(subredditService).toBeDefined();
  });
  describe('create', () => {
    it('should create subreddit successfully', async () => {
      const subreddit = await subredditService.create(subreddit1);
      expect(subreddit).toEqual(
        expect.objectContaining({
          name: subreddit1.name,
          type: subreddit1.type,
          over18: subreddit1.over18,
          ...defaultFields,
        }),
      );
    });
    it('should throw an error', async () => {
      await expect(async () => {
        await subredditService.create(subredditDefault);
      }).rejects.toThrowError();
    });
  });

  describe('findSubreddit', () => {
    it('Should find the subreddit successfully', async () => {
      const sr = await subredditService.findSubreddit(id);
      expect(sr).toEqual(
        expect.objectContaining({
          ...subredditDefault,
          ...defaultFields,
        }),
      );
    });

    it('Should throw an error', async () => {
      await expect(async () => {
        await subredditService.findSubreddit('6363fba4ab2c2f94f3ac9f31');
      }).rejects.toThrow('No subreddit with such id');

      await expect(async () => {
        await subredditService.findSubreddit('6363fba4ab2c2f94f3ac9f31');
      }).rejects.toThrowError();
    });
  });

  describe('updateSubreddit', () => {
    const updatedFields: UpdateSubredditDto = {
      acceptFollowers: false,
      type: 'private',
    };

    it('Should update the subreddit successfully', async () => {
      const subredditUpdated = await subredditService.update(id, updatedFields);
      expect(subredditUpdated).toEqual({ status: 'success' });
    });

    it('Should throw an error', async () => {
      await expect(async () => {
        await subredditService.update(
          '6363fba4ab2c2f94f3ac9f31',
          updatedFields,
        );
      }).rejects.toThrow('No subreddit with such id');
      await expect(async () => {
        await subredditService.update(
          '6363fba4ab2c2f94f3ac9f31',
          updatedFields,
        );
      }).rejects.toThrowError();
    });
  });

  describe('createFlair', () => {
    const flair: FlairDto = {
      backgroundColor: 'aaa321',
      textColor: 'fff',
      text: 'welcome',
    };

    it('Should create the flair successfully', async () => {
      const subredditWithFlairs1 = await subredditService.createFlair(
        id,
        flair,
      );
      const newFlair1: FlairDto = {
        ...flair,
        _id: new mongoose.Types.ObjectId(
          subredditWithFlairs1.flairList[0]._id.toString(),
        ),
      };
      expect(subredditWithFlairs1).toEqual(
        expect.objectContaining({
          _id: new mongoose.Types.ObjectId(id),
          flairList: [newFlair1],
        }),
      );
      const subredditWithFlairs2 = await subredditService.createFlair(
        id,
        flair,
      );
      const newFlair2: FlairDto = {
        ...flair,
        _id: new mongoose.Types.ObjectId(
          subredditWithFlairs2.flairList[1]._id.toString(),
        ),
      };
      expect(subredditWithFlairs2).toEqual(
        expect.objectContaining({
          _id: new mongoose.Types.ObjectId(id),
          flairList: [newFlair1, newFlair2],
        }),
      );
    });
  });

  describe('deleteFlairById', () => {
    const flair: FlairDto = {
      backgroundColor: 'aaa321',
      textColor: 'fff',
      text: 'welcome',
    };

    it('Should delete the flair successfully', async () => {
      const subredditWithFlairs1 = await subredditService.createFlair(
        id,
        flair,
      );
      const newFlair1: FlairDto = {
        ...flair,
        _id: new mongoose.Types.ObjectId(
          subredditWithFlairs1.flairList[0]._id.toString(),
        ),
      };
      const subredditWithFlairs2 = await subredditService.createFlair(
        id,
        flair,
      );
      const newFlair2: FlairDto = {
        ...flair,
        _id: new mongoose.Types.ObjectId(
          subredditWithFlairs2.flairList[1]._id.toString(),
        ),
      };
      const newSubreddit = await subredditService.deleteFlairById(
        id,
        newFlair1._id.toString(),
      );
      expect(newSubreddit).toEqual({
        status: 'success',
      });
    });
  });

  describe('uploadIcon', () => {
    it('The Icon uploaded successfully', async () => {
      const file = await readFile(__dirname + '/test/photos/testingPhoto.jpeg');
      await subredditService.uploadIcon(id, { buffer: file });
      await expect(
        typeof (await readFile(`src/statics/subreddit_icons/${id}.jpeg`)),
      ).toBe('object');
      await subredditService.removeIcon(id);
    });
  });

  describe('removeIcon', () => {
    it('The Icon removed successfully', async () => {
      const file = await readFile(__dirname + '/test/photos/testingPhoto.jpeg');
      await subredditService.uploadIcon(id, { buffer: file });
      const sr = await subredditService.findSubreddit(id);
      expect(sr.icon).toBe(`src/statics/subreddit_icons/${id}.jpeg`);
      await subredditService.removeIcon(id);
      const srWithoutIcon = await subredditService.findSubreddit(id);
      expect(srWithoutIcon.icon).toBe(null);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    module.close();
  });
});

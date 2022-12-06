import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { readFile } from 'fs/promises';
import mongoose, { Types } from 'mongoose';

import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import { stubImagesHandler } from '../utils/imagesHandler/test/stubs/image-handler.stub';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import type { CreateSubredditDto } from './dto/create-subreddit.dto';
import type { FlairDto } from './dto/flair.dto';
import type { UpdateSubredditDto } from './dto/update-subreddit.dto';
import type { SubredditDocument } from './subreddit.schema';
import { SubredditSchema } from './subreddit.schema';
import { SubredditService } from './subreddit.service';
import { SubredditUserSchema } from './subreddit-user.schema';

jest.mock('../utils/imagesHandler/images-handler.service');
describe('SubredditService', () => {
  let subredditService: SubredditService;
  let module: TestingModule;
  let id: string;
  let subredditDocument: SubredditDocument;

  const userId = new Types.ObjectId(1);

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

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        rootMongooseTestModule(),
        ImagesHandlerModule,
        MongooseModule.forFeature([
          { name: 'Subreddit', schema: SubredditSchema },
          { name: 'UserSubreddit', schema: SubredditUserSchema },
        ]),
      ],
      providers: [SubredditService],
    }).compile();
    subredditService = module.get<SubredditService>(SubredditService);
    subredditDocument = await subredditService.create(subredditDefault, userId);
    id = subredditDocument._id.toString();
  });

  it('should be defined', () => {
    expect(subredditService).toBeDefined();
  });
  describe('create', () => {
    it('should create subreddit successfully', async () => {
      const subreddit = await subredditService.create(subreddit1, userId);
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
        await subredditService.create(subredditDefault, userId);
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

  describe('findSubredditByName', () => {
    it('Should find the subreddit successfully', async () => {
      const sr = await subredditService.findSubredditByName(
        subredditDocument.name,
      );
      expect(sr).toEqual(
        expect.objectContaining({
          ...subredditDefault,
          ...defaultFields,
        }),
      );
    });

    it('Should throw an error', async () => {
      await expect(async () => {
        await subredditService.findSubredditByName('JPDptiOyGFdH');
      }).rejects.toThrow('No subreddit with such name');

      await expect(async () => {
        await subredditService.findSubredditByName('JPDptiOyGFdH');
      }).rejects.toThrowError(NotFoundException);
    });
  });

  describe('checkSubredditAvailable', () => {
    it('Should return that the subreddit name is available', async () => {
      const sr = await subredditService.checkSubredditAvailable('JPDptiOyGFdH');
      expect(sr).toEqual(
        expect.objectContaining({
          status: 'success',
        }),
      );
    });

    it('Should throw an error', async () => {
      await expect(async () => {
        await subredditService.checkSubredditAvailable(subredditDocument.name);
      }).rejects.toThrow('Subreddit name is unavailable');

      await expect(async () => {
        await subredditService.checkSubredditAvailable(subredditDocument.name);
      }).rejects.toThrowError(ConflictException);
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

      // flair object was unused here
      new mongoose.Types.ObjectId(
        subredditWithFlairs2.flairList[1]._id.toString(),
      );

      if (newFlair1._id) {
        const newSubreddit = await subredditService.deleteFlairById(
          id,
          newFlair1._id.toString(),
        );
        expect(newSubreddit).toEqual({
          status: 'success',
        });
      } else {
        expect(newFlair1._id).toBeDefined();
      }
    });
  });

  describe('uploadIcon', () => {
    it('should upload the icon successfully', async () => {
      const file = await readFile(__dirname + '/test/photos/testingPhoto.jpeg');
      expect(await subredditService.uploadIcon(id, { buffer: file })).toEqual(
        stubImagesHandler(),
      );
    });
  });

  describe('removeIcon', () => {
    it('should remove the icon successfully', async () => {
      expect(await subredditService.removeIcon(id)).toEqual({
        status: 'success',
      });
    });
    it('should throw error', async () => {
      await expect(
        subredditService.removeIcon(new Types.ObjectId(1).toString()),
      ).rejects.toThrowError('No subreddit with such id');
    });
  });

  describe('join subreddit', () => {
    // let user_id: Types.ObjectId;
    // beforeAll(() => {
    //   user_id = new Types.ObjectId(31);
    // });
    it('should throw bad exception', async () => {
      const subId = new Types.ObjectId(1);
      await expect(
        subredditService.joinSubreddit(userId, subId),
      ).rejects.toThrow(`there is no subreddit with id ${subId}`);
    });

    it('should join successfully', async () => {
      const res = await subredditService.joinSubreddit(
        userId,
        new Types.ObjectId(id),
      );
      expect(res).toEqual({ status: 'success' });
    });

    it('should throw duplicate error', async () => {
      await expect(
        subredditService.joinSubreddit(userId, new Types.ObjectId(id)),
      ).rejects.toThrow('duplicate key');
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

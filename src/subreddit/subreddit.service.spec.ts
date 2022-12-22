import { ConflictException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { readFile } from 'fs/promises';
import mongoose, { Types } from 'mongoose';

import { BlockModule } from '../block/block.module';
import { BlockSchema } from '../block/block.schema';
import { FollowModule } from '../follow/follow.module';
import { FollowSchema } from '../follow/follow.schema';
import { NotificationModule } from '../notification/notification.module';
import { HideSchema } from '../post/hide.schema';
import { PostCommentSchema } from '../post-comment/post-comment.schema';
import { PostCommentService } from '../post-comment/post-comment.service';
import { UserModule } from '../user/user.module';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import { stubImagesHandler } from '../utils/imagesHandler/test/stubs/image-handler.stub';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { VoteSchema } from '../vote/vote.schema';
import type { CreateSubredditDto } from './dto/create-subreddit.dto';
import type { FlairDto } from './dto/flair.dto';
import type { MuteUserDto } from './dto/mute-user.dto';
import type { RuleDto } from './dto/rule.dto';
import type { UpdateSubredditDto } from './dto/update-subreddit.dto';
import type { SubredditDocument } from './subreddit.schema';
import { SubredditSchema } from './subreddit.schema';
import { SubredditService } from './subreddit.service';
import { SubredditUserSchema } from './subreddit-user.schema';
import { SubredditUserLeftSchema } from './subreddit-user-left.schema';

jest.mock('../utils/imagesHandler/images-handler.service');
describe('SubredditService', () => {
  let subredditService: SubredditService;
  let module: TestingModule;
  let id: string;
  let subredditDocument: SubredditDocument;

  let userId;
  let userIdNewAskToJoin;
  let username;
  let usernameNewModerator;
  const userMute1: MuteUserDto = {
    username: '',
    reason: 'bad words',
  };
  const userMute2: MuteUserDto = {
    username: '',
    reason: 'funny',
  };
  let ruleId1;
  let ruleId2;
  const pagination: PaginationParamsDto = { limit: 10, page: 1, sort: 'new' };
  const rule: RuleDto = {
    rule: 'No photo',
    to: 2,
  };

  const subTopics = ['a', 'b', 'c', 'd', 'e'];

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
        UserModule,
        FollowModule,
        BlockModule,
        NotificationModule,
        MongooseModule.forFeature([
          {
            name: 'PostComment',
            schema: PostCommentSchema,
          },
          { name: 'Follow', schema: FollowSchema },
          { name: 'Block', schema: BlockSchema },
          { name: 'Hide', schema: HideSchema },
          { name: 'Subreddit', schema: SubredditSchema },
          { name: 'UserSubreddit', schema: SubredditUserSchema },
          { name: 'UserSubredditLeft', schema: SubredditUserLeftSchema },
          { name: 'User', schema: UserSchema },
          {
            name: 'Vote',
            schema: VoteSchema,
          },
        ]),
      ],
      providers: [
        SubredditService,
        ApiFeaturesService,
        UserService,
        PostCommentService,
      ],
    }).compile();
    subredditService = module.get<SubredditService>(SubredditService);
    const userService = module.get<UserService>(UserService);
    const userData = {
      username: 'omarfareed',
      password: '12345678',
      email: 'email@example.com',
    };
    const u1 = await userService.createUser(userData);
    userData.username = 'aref';
    const u2 = await userService.createUser(userData);
    userData.username = 'kamal';
    const u3 = await userService.createUser(userData);
    userData.username = 'abdelhady';
    const u4 = await userService.createUser(userData);
    userData.username = 'assad';
    const u5 = await userService.createUser(userData);
    userId = u1._id;
    userIdNewAskToJoin = u3._id;
    username = u1.username;
    usernameNewModerator = u2.username;
    userMute1.username = u4.username;
    userMute2.username = u5.username;
    subredditDocument = await subredditService.create(
      subredditDefault,
      username,
      userId,
    );
    id = subredditDocument._id.toString();
  });

  it('should be defined', () => {
    expect(subredditService).toBeDefined();
  });
  describe('create', () => {
    it('should create subreddit successfully', async () => {
      const subreddit = await subredditService.create(
        subreddit1,
        username,
        userId,
      );
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
        await subredditService.create(subredditDefault, username, userId);
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
      }).rejects.toThrowError();

      await expect(async () => {
        await subredditService.findSubredditByName('JPDptiOyGFdH');
      }).rejects.toThrowError();
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
      const subredditUpdated = await subredditService.update(
        subredditDocument.name,
        updatedFields,
        username,
      );
      expect(subredditUpdated).toEqual({ status: 'success' });
    });

    it('Should throw an error', async () => {
      await expect(async () => {
        await subredditService.update(
          subredditDocument.name,
          updatedFields,
          userMute1.username,
        );
      }).rejects.toThrowError();
    });

    it('Should throw an error', async () => {
      await expect(async () => {
        await subredditService.update('dsah1', updatedFields, username);
      }).rejects.toThrowError();
      await expect(async () => {
        await subredditService.update('ad;slkj1', updatedFields, username);
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
        username,
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
        username,
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
        username,
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
        username,
      );

      // flair object was unused here
      new mongoose.Types.ObjectId(
        subredditWithFlairs2.flairList[1]._id.toString(),
      );

      if (newFlair1._id) {
        const newSubreddit = await subredditService.deleteFlairById(
          id,
          newFlair1._id.toString(),
          username,
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
      expect(
        await subredditService.uploadIcon(id, { buffer: file }, username),
      ).toEqual(stubImagesHandler());
    });
  });

  describe('removeIcon', () => {
    it('should throw error', async () => {
      await expect(
        subredditService.removeIcon(id, 'usernotexist'),
      ).rejects.toThrowError();
    });
    it('should remove the icon successfully', async () => {
      expect(await subredditService.removeIcon(id, username)).toEqual({
        status: 'success',
      });
    });
    it('should throw error', async () => {
      await expect(
        subredditService.removeIcon(new Types.ObjectId(1).toString(), username),
      ).rejects.toThrowError();
    });
  });

  describe('join subreddit', () => {
    it('should throw bad exception', async () => {
      const subId = new Types.ObjectId(1);
      await expect(
        subredditService.joinSubreddit(userId, subId),
      ).rejects.toThrow(`there is no subreddit with id ${subId}`);
    });

    it('should join successfully', async () => {
      const res = await subredditService.joinSubreddit(
        new Types.ObjectId(151),
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

  describe('add categories', () => {
    it('should add cateogries successfully', async () => {
      const res = await subredditService.addSubredditCategories(
        subredditDocument._id,
        username,
        ['sport', 'news'],
      );
      expect(res).toEqual({ status: 'success' });
    });

    it('should add cateogries successfully', async () => {
      await subredditService.addSubredditCategories(
        subredditDocument._id,
        username,
        ['finance', 'news'],
      );
      const sr = await subredditService.findSubreddit(subredditDocument._id);

      expect(sr.categories).toEqual(['sport', 'news', 'finance']);
    });

    it('should throw error', async () => {
      await expect(
        subredditService.addSubredditCategories(
          subredditDocument._id,
          username,
          ['sport'],
        ),
      ).rejects.toThrowError();
    });
  });

  describe('get categories', () => {
    it('should get cateogries successfully', async () => {
      const res = await subredditService.getSubredditsWithCategory('sport');
      expect(res.length).toEqual(1);
      expect(res[0]._id).toEqual(subredditDocument._id);
      expect(res[0].categories.length).toEqual(3);
    });

    it('should return empty array', async () => {
      const res = await subredditService.getSubredditsWithCategory('notExist');
      expect(res.length).toEqual(0);
    });
  });

  describe('add new moderator', () => {
    it('should add moderator successfully', async () => {
      const res = await subredditService.addNewModerator(
        username,
        usernameNewModerator,
        subredditDocument._id,
      );
      const sr = await subredditService.findSubreddit(subredditDocument._id);
      expect(res).toEqual({ status: 'success' });
      expect(sr.moderators).toEqual([username, usernameNewModerator]);
    });
    it('should return unauth error', async () => {
      await expect(
        subredditService.addNewModerator(
          'not_exist_user',
          usernameNewModerator,
          subredditDocument._id,
        ),
      ).rejects.toThrowError('Unauthorized');
    });
    it('should return you are already a moderator', async () => {
      await expect(
        subredditService.addNewModerator(
          username,
          usernameNewModerator,
          subredditDocument._id,
        ),
      ).rejects.toThrowError('You are already a moderator in that subreddit');
    });
  });

  describe('get subreddits I moderate', () => {
    it('should get subreddits successfully', async () => {
      const res = await subredditService.getSubredditsWithMatch(
        { moderators: username },
        1,
        10,
        userId,
      );
      expect(res.length).toEqual(2);
      expect(res[0]._id).toEqual(subredditDocument._id);
    });

    it('should return empty array', async () => {
      const res = await subredditService.getSubredditsWithMatch(
        { moderators: 'hf91' },
        1,
        10,
        userId,
      );
      expect(res.length).toEqual(0);
    });
  });

  describe('get subreddits I joined', () => {
    it('should get subreddits successfully', async () => {
      const res = await subredditService.subredditsIJoined(userId);
      expect(res.length).toEqual(2);
      expect(res[0]._id).toEqual(subredditDocument._id);
    });
    it('should return empty array', async () => {
      const res = await subredditService.subredditsIJoined(
        new Types.ObjectId(13),
      );
      expect(res.length).toEqual(0);
    });
  });

  describe('get subreddit moderators', () => {
    it('should get moderators successfully', async () => {
      const res = await subredditService.getSubredditModerators(
        subredditDocument._id,
      );
      expect(res.length).toEqual(2);
      expect(res[0]._id).toEqual(userId);
    });
    it('should return empty array', async () => {
      const res = await subredditService.subredditsIJoined(
        new Types.ObjectId(13),
      );
      expect(res.length).toEqual(0);
    });
  });

  describe('is in a subreddit', () => {
    it('should be part of that subreddit', async () => {
      const res = await subredditService.isJoined(
        userId,
        subredditDocument._id,
      );
      expect(res).toBe(true);
    });

    it('should not be in that subreddit', async () => {
      const res = await subredditService.isJoined(
        userId,
        new Types.ObjectId(20),
      );
      expect(res).toBe(false);
    });
  });

  describe('is a moderator in subreddit', () => {
    it('should be part of that subreddit', async () => {
      const res = await subredditService.isModerator(
        username,
        subredditDocument._id,
      );
      expect(res).toBe(true);
    });

    it('should not be in that subreddit', async () => {
      const res = await subredditService.isModerator(
        username,
        new Types.ObjectId(20),
      );
      expect(res).toBe(false);
    });
  });

  describe('add subreddit rule', () => {
    it('should add rule successfully', async () => {
      const res1 = await subredditService.addRule(
        subredditDocument._id,
        username,
        rule,
      );
      expect(res1).toEqual(expect.objectContaining(rule));
      ruleId1 = res1._id;
      rule.description = 'test';
      const res2 = await subredditService.addRule(
        subredditDocument._id,
        username,
        rule,
      );
      expect(res2).toEqual(expect.objectContaining(rule));
      ruleId2 = res2._id;
    });
    it('should throw error', async () => {
      await expect(
        subredditService.addRule(new Types.ObjectId(1431), username, rule),
      ).rejects.toThrowError();
    });
  });

  describe('update subreddit rule', () => {
    it('should update rule successfully', async () => {
      const updateObject = {
        rule: 'nothing is allowed',
        to: 0,
      };

      await subredditService.updateRule(
        subredditDocument._id,
        ruleId2,
        username,
        updateObject,
      );

      const { rules } = await subredditService.findSubreddit(
        subredditDocument._id,
      );

      expect(rules[1]).toEqual(
        expect.objectContaining({
          ...rule,
          ...updateObject,
          _id: ruleId2,
        }),
      );
    });
    it('should throw error', async () => {
      await expect(
        subredditService.updateRule(
          new Types.ObjectId(1431),
          ruleId1,
          username,
          rule,
        ),
      ).rejects.toThrowError();
    });
  });

  describe('delete subreddit rule', () => {
    it('should delete rule successfully', async () => {
      await subredditService.deleteRule(
        subredditDocument._id,
        ruleId2,
        username,
      );

      const { rules } = await subredditService.findSubreddit(
        subredditDocument._id,
      );

      expect(rules.length).toEqual(1);
      expect(rules[0]._id).toEqual(ruleId1);
    });
    it('should throw error', async () => {
      await expect(
        subredditService.deleteRule(
          subredditDocument._id,
          ruleId1,
          '5y198yhdwq',
        ),
      ).rejects.toThrowError();
    });
  });

  describe('ask to join a sr', () => {
    it('should ask to join a sr successfully', async () => {
      const res = await subredditService.askToJoinSr(
        subredditDocument._id,
        userIdNewAskToJoin,
      );
      expect(res).toEqual({ status: 'success' });
    });
    it('should return an error', async () => {
      await expect(
        subredditService.askToJoinSr(subredditDocument._id, userIdNewAskToJoin),
      ).rejects.toThrowError();
    });
  });

  describe('getUsersAskToJoin', () => {
    it('should return users successfully', async () => {
      const res = await subredditService.getUsersAskingToJoinSubreddit(
        subredditDocument._id,
        username,
      );

      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(
        expect.objectContaining({
          username: 'kamal',
          _id: userIdNewAskToJoin,
        }),
      );
    });
  });

  describe('accept user request to join', () => {
    it('should return users successfully', async () => {
      await subredditService.acceptToJoinSr(
        subredditDocument._id,
        username,
        userIdNewAskToJoin,
      );
      expect(
        await subredditService.isJoined(
          userIdNewAskToJoin,
          subredditDocument._id,
        ),
      ).toBe(true);

      expect(
        await subredditService.getUsersAskingToJoinSubreddit(
          subredditDocument._id,
          username,
        ),
      ).toEqual([]);
    });

    it('should return errors', async () => {
      await expect(
        subredditService.acceptToJoinSr(
          subredditDocument._id,
          username,
          userIdNewAskToJoin,
        ),
      ).rejects.toThrowError();

      await expect(
        subredditService.acceptToJoinSr(
          new Types.ObjectId(186),
          username,
          userIdNewAskToJoin,
        ),
      ).rejects.toThrowError();

      await expect(
        subredditService.acceptToJoinSr(
          subredditDocument._id,
          'hfdioa33',
          userIdNewAskToJoin,
        ),
      ).rejects.toThrowError();
    });
  });

  describe('mute, approve and banned user used function', () => {
    it('should add a user successfully', async () => {
      const res1 = await subredditService.addUserToListUserDate(
        subredditDocument._id,
        username,
        userMute1,
        'mutedUsers',
      );
      expect(res1).toEqual({ status: 'success' });

      const res2 = await subredditService.addUserToListUserDate(
        subredditDocument._id,
        username,
        userMute2,
        'mutedUsers',
      );
      expect(res2).toEqual({ status: 'success' });
    });
    it('should throw error already added', async () => {
      await expect(
        subredditService.addUserToListUserDate(
          subredditDocument._id,
          username,
          userMute1,
          'mutedUsers',
        ),
      ).rejects.toThrowError();
    });
    it('should throw error moderator cant mute another moderator', async () => {
      const userMuteModerator: MuteUserDto = {
        reason: 'funny',
        username: usernameNewModerator,
      };
      // extra stage is not exist with approve operation.
      await expect(
        subredditService.addUserToListUserDate(
          subredditDocument._id,
          username,
          userMuteModerator,
          'mutedUsers',
          { moderators: { $ne: usernameNewModerator } },
        ),
      ).rejects.toThrowError();
    });
    it('should throw error not a moderator', async () => {
      const userNew: MuteUserDto = {
        reason: 'funny',
        username,
      };

      await expect(
        subredditService.addUserToListUserDate(
          subredditDocument._id,
          'not_moderator',
          userNew,
          'mutedUsers',
        ),
      ).rejects.toThrowError();
    });
  });

  describe('get users from userDate list', () => {
    it('should get users successfully', async () => {
      const res = await subredditService.getUsersFromListUserDate(
        subredditDocument._id,
        username,
        'mutedUsers',
      );
      expect(res).toEqual([
        expect.objectContaining({
          username: userMute1.username,
        }),
        expect.objectContaining({
          username: userMute2.username,
        }),
      ]);
    });
  });

  describe('remove user from list data', () => {
    it('should throw error not a moderator', async () => {
      await expect(
        subredditService.removeUserFromListUserDate(
          subredditDocument._id,
          userMute1.username,
          userMute2.username,
          'mutedUsers',
        ),
      ).rejects.toThrowError();
    });
    it('should remove a user from the list successfully', async () => {
      await subredditService.removeUserFromListUserDate(
        subredditDocument._id,
        username,
        userMute2.username,
        'mutedUsers',
      );
      await subredditService.removeUserFromListUserDate(
        subredditDocument._id,
        username,
        userMute1.username,
        'mutedUsers',
      );
      const res = await subredditService.getUsersFromListUserDate(
        subredditDocument._id,
        username,
        'mutedUsers',
      );
      expect(res.length).toEqual(0);
    });
  });

  describe('get subreddits', () => {
    let sr;
    const type = undefined;
    beforeAll(async () => {
      sr = await subredditService.create(
        {
          name: 'sr',
          over18: true,
          type: 'ty',
        },
        username,
        userId,
      );
    });
    it('must get all posts successfully', async () => {
      const res = await subredditService.getUnModeratedThings(
        sr._id,
        username,
        pagination,
        type,
      );
      expect(res).toEqual([]);
    });
    it('must throw an error because not a moderator', async () => {
      await expect(
        subredditService.getUnModeratedThings(
          sr._id,
          'wrong_username',
          pagination,
          type,
        ),
      ).rejects.toThrow('moderator');
    });
    it('must throw an error because wrong subredditId', async () => {
      await expect(
        subredditService.getUnModeratedThings(
          userId,
          username,
          pagination,
          type,
        ),
      ).rejects.toThrow('wrong');
    });
    it('must get all posts successfully', async () => {
      const res = await subredditService.getSpammedThings(
        sr._id,
        username,
        pagination,
        type,
      );
      expect(res).toEqual([]);
    });
    it('must throw an error because not a moderator', async () => {
      await expect(
        subredditService.getSpammedThings(
          sr._id,
          'wrong_username',
          pagination,
          type,
        ),
      ).rejects.toThrow('moderator');
    });
    it('must throw an error because wrong subredditId', async () => {
      await expect(
        subredditService.getSpammedThings(userId, username, pagination, type),
      ).rejects.toThrow('wrong');
    });
    it('must get all posts successfully', async () => {
      const res = await subredditService.getEditedThings(
        sr._id,
        username,
        pagination,
        type,
      );
      expect(res).toEqual([]);
    });
    it('must throw an error because not a moderator', async () => {
      await expect(
        subredditService.getEditedThings(
          sr._id,
          'wrong_username',
          pagination,
          type,
        ),
      ).rejects.toThrow('moderator');
    });
    it('must throw an error because wrong subredditId', async () => {
      await expect(
        subredditService.getEditedThings(userId, username, pagination, type),
      ).rejects.toThrow('wrong');
    });
  });

  // So dependable ==> have to test both of them together
  describe('add subTopics and activeTopic', () => {
    it('should add subtopic successfully', async () => {
      const res1 = await subredditService.addSubTobics(
        subredditDocument._id,
        subTopics,
        username,
      );
      expect(res1).toEqual({ status: 'success' });
    });
    it('should add activeTopic successfully', async () => {
      const res2 = await subredditService.addActiveTobic(
        subredditDocument._id,
        subTopics[1],
        username,
      );
      expect(res2).toEqual({ status: 'success' });
      const sr = await subredditService.findSubreddit(
        subredditDocument._id.toString(),
      );

      expect(sr).toEqual(
        expect.objectContaining({
          activeTopic: subTopics[1],
          subTopics: subTopics.filter((_, i) => i !== 1),
        }),
      );
    });
    it('should throw error (activeTopic not in subTopics)', async () => {
      await expect(
        subredditService.addActiveTobic(
          subredditDocument._id,
          'noExist',
          username,
        ),
      ).rejects.toThrowError();
    });

    it('should throw error (activeTopic not in new subTopics)', async () => {
      await expect(
        subredditService.addSubTobics(
          subredditDocument._id,
          ['sport', 'math', 'physics'],
          username,
        ),
      ).rejects.toThrowError();
    });

    it('should add subTopics successfully', async () => {
      const res = await subredditService.addSubTobics(
        subredditDocument._id,
        ['sport', 'math', 'physics', 'b'],
        username,
      );
      expect(res).toEqual({ status: 'success' });
      const sr = await subredditService.findSubreddit(
        subredditDocument._id.toString(),
      );

      expect(sr).toEqual(
        expect.objectContaining({
          activeTopic: subTopics[1],
          subTopics: ['sport', 'math', 'physics'],
        }),
      );
    });
  });

  let statName: string;
  let statId: Types.ObjectId;

  const createDummyDataForStats = async () => {
    const sr = await subredditService.create(
      {
        name: 'stat',
        over18: false,
        type: 'public',
      },
      username,
      userId,
    );

    statId = sr._id;
    statName = sr.name;

    const promisesJoined: any = [];
    const promisesLeft: any = [];
    const ides: any = [];

    for (let i = 0; i < 20; i++) {
      ides.push(new Types.ObjectId(i));

      promisesJoined.push(subredditService.joinSubreddit(ides[i], statId));
    }

    await Promise.all(promisesJoined);

    for (let i = 0; i < 20; i += 3) {
      promisesLeft.push(subredditService.leaveSubreddit(ides[i], statId));
    }

    await Promise.all(promisesLeft);
  };

  // formatOutputOfWeekStats(data) {

  // }

  describe('subreddit statitistics', () => {
    it('should get statitstics right', async () => {
      await createDummyDataForStats();
      const res = await subredditService.getSrStatitisticsWeek(statName);

      expect(res.length).toBe(1);
      expect(res[0]).toEqual(expect.objectContaining({ joined: 14, left: 7 }));
    });
  });

  describe('subreddit statitistics', () => {
    it('should get statitstics right', async () => {
      const res = await subredditService.getSrStatitisticsYear(statName);

      expect(res.length).toBe(1);
      expect(res[0]).toEqual(expect.objectContaining({ joined: 14, left: 7 }));
    });
  });

  describe('leave subreddit', () => {
    it('should throw bad exception', async () => {
      const subId = new Types.ObjectId(1);
      await expect(
        subredditService.leaveSubreddit(userId, subId),
      ).rejects.toThrow(
        `user with id ${userId} not joined subreddit with id ${subId}`,
      );
    });

    it('should leave successfully', async () => {
      const res = await subredditService.leaveSubreddit(
        userId,
        new Types.ObjectId(id),
      );
      expect(res).toEqual({ status: 'success' });
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

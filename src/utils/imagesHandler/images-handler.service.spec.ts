import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { readFile, unlink } from 'fs/promises';

import { UserSchema } from '../../user/user.schema';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../mongoose-in-memory';
import { ReturnModelTest } from '../testing/return-model-testing';
import { TestModelSchema } from '../testing/test-api-feature-model-testing';
import { ImagesHandlerService } from './images-handler.service';

describe('ImagesHandlerService', () => {
  let imagesHandlerservice: ImagesHandlerService;
  let modelTestService: ReturnModelTest;
  let module: TestingModule;
  let id;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'User', schema: UserSchema },
          { name: 'TestModel', schema: TestModelSchema },
        ]),
      ],
      providers: [ImagesHandlerService, ReturnModelTest],
    }).compile();
    modelTestService = module.get<ReturnModelTest>(ReturnModelTest);
    imagesHandlerservice =
      module.get<ImagesHandlerService>(ImagesHandlerService);
    const data = await modelTestService.getTestModel().create({
      name: 'user',
      age: 10,
      birthDate: new Date(),
    });
    id = data._id;
  });

  it('should be defined', () => {
    expect(modelTestService).toBeDefined();
    expect(imagesHandlerservice).toBeDefined();
  });

  describe('uploadPhoto', () => {
    it('should upload the photo successfully', async () => {
      const directory =
        __dirname.slice(0, __dirname.lastIndexOf('\\imagesHandler')) +
        '\\testing\\photos\\testingPhoto.jpeg';
      const file = await readFile(directory);
      const photoDirectory = await imagesHandlerservice.uploadPhoto(
        'profile_icons',
        { buffer: file },
        modelTestService.getTestModel(),
        id,
        'optionalTestField',
      );
      expect(
        await modelTestService
          .getTestModel()
          .findById({ _id: id })
          .select('optionalTestField'),
      ).toEqual(expect.objectContaining(photoDirectory));
      expect(typeof (await readFile(photoDirectory.optionalTestField))).toBe(
        'object',
      );
      await unlink(photoDirectory.optionalTestField);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

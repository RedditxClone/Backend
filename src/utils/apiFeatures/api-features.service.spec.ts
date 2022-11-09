import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../mongoose-in-memory';
import { ApiFeaturesService } from './api-features.service';
import { ReturnModelTest } from './testing/return-model-testing';
import { TestApiFeatureSchema } from './testing/test-api-feature-model-testing';
describe('apiFeaturesService', () => {
  let modelTestService: ReturnModelTest;
  let apiFeaturesService: ApiFeaturesService;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'TestApiFeature', schema: TestApiFeatureSchema },
        ]),
      ],
      providers: [ApiFeaturesService, ReturnModelTest],
    }).compile();

    modelTestService = module.get<ReturnModelTest>(ReturnModelTest);
    apiFeaturesService = module.get<ApiFeaturesService>(ApiFeaturesService);

    const model = modelTestService.getTestApiFeatureModel();
    const date = Date.now();
    const promises: any[] = [];

    for (let i = 10; i < 100; i++) {
      promises.push(
        model.create({
          name: `test_${i}`,
          age: i,
          birthDate: new Date(date - new Date().getFullYear() * 10),
        }),
      );
    }

    await Promise.all(promises);
  });

  it('should be defined', () => {
    expect(modelTestService).toBeDefined();
    expect(apiFeaturesService).toBeDefined();
  });
  describe('test api Features', () => {
    it('should return one object', async () => {
      const model = modelTestService.getTestApiFeatureModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { age: 10 },
        { searchBy: true },
      );
      expect(data.length).toEqual(1);
      expect(data[0]).toEqual(
        expect.objectContaining({
          name: 'test_10',
          age: 10,
          birthDate: data[0].birthDate,
          _id: data[0]._id,
          __v: data[0].__v,
        }),
      );
    });
    it('should return 18 objects', async () => {
      const model = modelTestService.getTestApiFeatureModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { page: 2, limit: 18 },
        { pagination: true },
      );
      expect(data.length).toEqual(18);
    });
    it('should return 15 objects', async () => {
      const model = modelTestService.getTestApiFeatureModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { page: 3 },
        { pagination: true },
      );
      expect(data.length).toEqual(15);
    });

    it('should not return any objects', async () => {
      const model = modelTestService.getTestApiFeatureModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { age: 5 },
        { searchBy: true },
      );
      expect(data.length).toEqual(0);
    });

    it('should return objects sorted by data', async () => {
      const model = modelTestService.getTestApiFeatureModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { sort: 'age' },
        { sort: true },
      );

      for (let i = 1; i < data.length; i++) {
        expect(data[i].age).toBeGreaterThan(data[i - 1].age);
      }
    });

    it('should return only the id and the name', async () => {
      const model = modelTestService.getTestApiFeatureModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { fields: '-_id,age,name', limit: 1 },
        { fields: true, pagination: true },
      );
      expect(data.length).toBe(1);
      expect(data[0]).toEqual(
        expect.objectContaining({
          name: data[0].name,
          age: data[0].age,
        }),
      );
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../mongooseInMemory';
import { ApiFeaturesService } from './apiFeatures.service';
import { ReturnModelTest } from './testing/returnModelTesting';
import { TestApiFeatureSchema } from './testing/testApiFeatureModelTesting';

describe('apiFeaturesService', () => {
  let ModelTestService: ReturnModelTest;
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

    ModelTestService = module.get<ReturnModelTest>(ReturnModelTest);
    apiFeaturesService = module.get<ApiFeaturesService>(ApiFeaturesService);

    const model = ModelTestService.getTestApiFeatureModel();
    const date = Date.now();
    const promises = [];
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
    expect(ModelTestService).toBeDefined();
    expect(apiFeaturesService).toBeDefined();
  });
  describe('test api Features', () => {
    it('should return one object', async () => {
      const model = ModelTestService.getTestApiFeatureModel();
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
      const model = ModelTestService.getTestApiFeatureModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { page: 2, limit: 18 },
        { pagination: true },
      );
      expect(data.length).toEqual(18);
    });
    it('should return 15 objects', async () => {
      const model = ModelTestService.getTestApiFeatureModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { page: 3 },
        { pagination: true },
      );
      expect(data.length).toEqual(15);
    });

    it('should not return any objects', async () => {
      const model = ModelTestService.getTestApiFeatureModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { age: 5 },
        { searchBy: true },
      );
      expect(data.length).toEqual(0);
    });

    it('should return objects sorted by data', async () => {
      const model = ModelTestService.getTestApiFeatureModel();
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
      const model = ModelTestService.getTestApiFeatureModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { fields: '-_id,age,name', limit: 1 },
        { fields: true, pagination: true },
      );
      expect(data.length).toBe(1);
      expect(data[0]).toEqual(
        expect.objectContaining({
          name: 'test_10',
          age: 10,
        }),
      );
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    module.close();
  });
});

import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../mongoose-in-memory';
import { ReturnModelTest } from '../testing/return-model-testing';
import { TestModelSchema } from '../testing/test-api-feature-model-testing';
import { ApiFeaturesService } from './api-features.service';
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
          { name: 'TestModel', schema: TestModelSchema },
        ]),
      ],
      providers: [ApiFeaturesService, ReturnModelTest],
    }).compile();

    modelTestService = module.get<ReturnModelTest>(ReturnModelTest);
    apiFeaturesService = module.get<ApiFeaturesService>(ApiFeaturesService);

    const model = modelTestService.getTestModel();
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
      const model = modelTestService.getTestModel();
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
      const model = modelTestService.getTestModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { page: 2, limit: 18 },
        { pagination: true },
      );
      expect(data.length).toEqual(18);
    });
    it('should return 15 objects', async () => {
      const model = modelTestService.getTestModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { page: 3 },
        { pagination: true },
      );
      expect(data.length).toEqual(15);
    });

    it('should not return any objects', async () => {
      const model = modelTestService.getTestModel();
      const data = await apiFeaturesService.processQuery(
        model.find(),
        { age: 5 },
        { searchBy: true },
      );
      expect(data.length).toEqual(0);
    });

    it('should return objects sorted by data', async () => {
      const model = modelTestService.getTestModel();
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
      const model = modelTestService.getTestModel();
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

  describe('create paginated response', () => {
    it('should return paginated response based on query', async () => {
      const model = modelTestService.getTestModel();
      const result = await apiFeaturesService.getPaginatedResponseFromQuery(
        model.find().sort({ name: 'asc' }),
        { limit: 5, page: 2 },
      );
      expect(result.data).toHaveLength(5);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          name: 'test_15',
          age: 15,
          birthDate: result.data[0].birthDate,
          _id: result.data[0]._id,
          __v: result.data[0].__v,
        }),
      );
      expect(result.data[4]).toEqual(
        expect.objectContaining({
          name: 'test_19',
          age: 19,
          birthDate: result.data[0].birthDate,
          _id: result.data[4]._id,
          __v: result.data[4].__v,
        }),
      );
      expect(result.meta).toEqual(
        expect.objectContaining({
          page: 2,
          limit: 5,
          itemCount: 90,
          pageCount: 18,
          hasPreviousPage: true,
          hasNextPage: true,
        }),
      );
    });

    it('should return empty paginated response based on query', async () => {
      const model = modelTestService.getTestModel();
      const result = await apiFeaturesService.getPaginatedResponseFromQuery(
        model.find({ name: 'not found' }),
        { limit: 5, page: 1 },
      );
      expect(result.data).toHaveLength(0);
      expect(result.meta).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 5,
          itemCount: 0,
          pageCount: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        }),
      );
    });

    it('should return paginated response based on aggregate', async () => {
      const model = modelTestService.getTestModel();
      const result = await apiFeaturesService.getPaginatedResponseFromAggregate(
        model.aggregate().sort({ name: 'asc' }),
        { limit: 5, page: 2 },
      );
      expect(result.data).toHaveLength(5);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          name: 'test_15',
          age: 15,
          birthDate: result.data[0].birthDate,
          _id: result.data[0]._id,
          __v: result.data[0].__v,
        }),
      );
      expect(result.data[4]).toEqual(
        expect.objectContaining({
          name: 'test_19',
          age: 19,
          birthDate: result.data[0].birthDate,
          _id: result.data[4]._id,
          __v: result.data[4].__v,
        }),
      );
      expect(result.meta).toEqual(
        expect.objectContaining({
          page: 2,
          limit: 5,
          itemCount: 90,
          pageCount: 18,
          hasPreviousPage: true,
          hasNextPage: true,
        }),
      );
    });
  });

  it('should return empty paginated response based on aggregate', async () => {
    const model = modelTestService.getTestModel();
    const result = await apiFeaturesService.getPaginatedResponseFromAggregate(
      model.aggregate().match({ name: 'not found' }),
      { limit: 5, page: 2 },
    );
    expect(result.data).toHaveLength(0);
    expect(result.meta).toEqual(
      expect.objectContaining({
        page: 2,
        limit: 5,
        itemCount: 0,
        pageCount: 0,
        hasPreviousPage: true,
        hasNextPage: false,
      }),
    );
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});

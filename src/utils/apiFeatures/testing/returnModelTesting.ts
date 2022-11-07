import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestApiFeature } from './testApiFeatureModelTesting';

export class ReturnModelTest {
  constructor(
    @InjectModel('TestApiFeature')
    private readonly testApiFeatureModel: Model<TestApiFeature>,
  ) {}
  getTestApiFeatureModel() {
    return this.testApiFeatureModel;
  }
}

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { TestApiFeature } from './test-api-feature-model-testing';

export class ReturnModelTest {
  constructor(
    @InjectModel('TestApiFeature')
    private readonly testApiFeatureModel: Model<TestApiFeature>,
  ) {}

  getTestApiFeatureModel() {
    return this.testApiFeatureModel;
  }
}

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { TestModel } from './test-api-feature-model-testing';

export class ReturnModelTest {
  constructor(
    @InjectModel('TestModel')
    private readonly testModel: Model<TestModel>,
  ) {}

  getTestModel() {
    return this.testModel;
  }
}

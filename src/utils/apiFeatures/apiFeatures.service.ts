import { BadRequestException } from '@nestjs/common';
import { Global, Injectable } from '@nestjs/common/decorators';
import { Document, Query } from 'mongoose';

@Global()
@Injectable()
export class ApiFeaturesService {
  private operations: Query<Document, any>;
  private query: any;
  processQuery(operation: Query<Document, any>, query: any) {
    this.query = query;
    this.operations = operation;
  }
  sort() {
    if (this.query.sort) {
      this.query.sort = this.query.sort.replace(',', ' ');
      this.operations.sort(this.query.sort);
    }
    return this;
  }
  pagination() {
    this.query.page = this.query.page || 1;
    this.query.limit = this.query.limit || 15;
    if (this.query.page <= 0 || this.query.limit < 0)
      throw new BadRequestException('Invalid Query');
    this.operations = this.operations
      .skip((this.query.page - 1) * this.query.limit)
      .limit(this.query.limit * 1);
    return this;
  }
  fields() {
    if (this.query.fields) {
      const fields = this.query.fields.split(',').join(' ');
      this.operations = this.operations.select(fields);
    }
    return this;
  }
}

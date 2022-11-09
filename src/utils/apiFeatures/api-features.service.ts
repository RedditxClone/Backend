import { BadRequestException } from '@nestjs/common';
import { Global, Injectable } from '@nestjs/common/decorators';
import { Query } from 'mongoose';

import type { ApiFeaturesOptionsDto } from './dto/api-features.dto';
@Global()
@Injectable()
export class ApiFeaturesService {
  processQuery(
    mongoQuery: Query<any, any>,
    reqQuery: any,
    queryOptions: ApiFeaturesOptionsDto | undefined,
  ): Query<any, any> {
    const clearQuery = ['sort', 'limit', 'page', 'fields'];
    const query = {};

    for (const e of clearQuery) {
      if (reqQuery[e]) {
        query[e] = reqQuery[e];
      }

      delete Query[e];
    }

    this.searchBy(mongoQuery, reqQuery, queryOptions?.searchBy ?? true);
    this.sort(mongoQuery, query, queryOptions?.sort ?? true);
    this.pagination(mongoQuery, query, queryOptions?.pagination ?? true);
    this.fields(mongoQuery, query, queryOptions?.fields ?? true);

    return mongoQuery;
  }

  private searchBy(mongoQuery: Query<any, any>, query: any, apply: boolean) {
    if (apply) {
      mongoQuery = mongoQuery.where(query);
    }
  }

  private sort(mongoQuery: Query<any, any>, query: any, apply: boolean) {
    if (apply && query.sort) {
      query.sort = query.sort.replace(',', ' ');
      mongoQuery = mongoQuery.sort(query.sort);
    }
  }

  private pagination(mongoQuery: Query<any, any>, query: any, apply: boolean) {
    if (apply) {
      query.page = query.page || 1;
      query.limit = query.limit || 15;

      if (query.page <= 0 || query.limit < 0) {
        throw new BadRequestException('Invalid Query');
      }

      mongoQuery = mongoQuery
        .skip((query.page - 1) * query.limit)
        .limit(Number(query.limit));
    }
  }

  private fields(mongoQuery: Query<any, any>, query: any, apply: boolean) {
    if (apply && query.fields) {
      const fields = query.fields.split(',').join(' ');
      mongoQuery = mongoQuery.select(fields);
    }
  }
}

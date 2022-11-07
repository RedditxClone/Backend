import { BadRequestException } from '@nestjs/common';
import { Global, Injectable } from '@nestjs/common/decorators';
import { Query } from 'mongoose';
import { ApiFeaturesOptionsDto } from './dto/apiFeaturesDto';
@Global()
@Injectable()
export class ApiFeaturesService {
  processQuery(
    mongoQuery: Query<any, any>,
    reqQuery: any,
    queryOptions: ApiFeaturesOptionsDto = {
      sort: true,
      fields: true,
      searchBy: true,
      pagination: true,
    },
  ): Query<any, any> {
    const clearQuery = ['sort', 'limit', 'page', 'fields'];
    const query = {};
    clearQuery.forEach((e) => {
      if (reqQuery[e]) query[e] = reqQuery[e];
      delete Query[e];
    });
    this.searchBy(mongoQuery, reqQuery, queryOptions.searchBy);
    this.sort(mongoQuery, query, queryOptions.sort);
    this.pagination(mongoQuery, query, queryOptions.pagination);
    this.fields(mongoQuery, query, queryOptions.fields);
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
      mongoQuery.sort(query.sort);
    }
  }

  private pagination(mongoQuery: Query<any, any>, query: any, apply: boolean) {
    if (apply) {
      query.page = query.page || 1;
      query.limit = query.limit || 15;
      if (query.page <= 0 || query.limit < 0)
        throw new BadRequestException('Invalid Query');
      mongoQuery = mongoQuery
        .skip((query.page - 1) * query.limit)
        .limit(query.limit * 1);
    }
  }

  private fields(mongoQuery: Query<any, any>, query: any, apply: boolean) {
    if (apply && query.fields) {
      const fields = query.fields.split(',').join(' ');
      mongoQuery = mongoQuery.select(fields);
    }
  }
}

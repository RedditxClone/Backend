import { BadRequestException } from '@nestjs/common';
import { Global, Injectable } from '@nestjs/common/decorators';
import type { Aggregate } from 'mongoose';
import { Query } from 'mongoose';

import type { PaginatedResponseDto, PaginationParamsDto } from './dto';
import { PaginationMetaDto } from './dto';
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

  async getPaginatedResponseFromQuery(
    mongoQuery: Query<any, any>,
    reqQuery: any,
    queryOptions?: ApiFeaturesOptionsDto,
  ) {
    queryOptions = queryOptions ?? {};
    queryOptions.pagination = true;

    const countQuery = mongoQuery.clone().count();

    const paginatedQuery = this.processQuery(
      mongoQuery,
      reqQuery,
      queryOptions,
    );
    const itemCount = await countQuery;
    const paginationData = await paginatedQuery;

    return this.createPaginatedResponse(reqQuery, paginationData, itemCount);
  }

  async getPaginatedResponseFromAggregate(
    mongoAggregate: Aggregate<any>,
    reqQuery: any,
  ) {
    const [paginatedAggregate] = await mongoAggregate
      .facet({
        data: [
          { $skip: (reqQuery.page - 1) * reqQuery.limit },
          { $limit: reqQuery.limit },
        ],
        itemCount: [{ $count: 'count' }],
      })
      .unwind({ path: '$itemCount' })
      .project({ data: '$data', itemCount: '$itemCount.count' });

    return this.createPaginatedResponse(
      reqQuery,
      paginatedAggregate?.data ?? [],
      paginatedAggregate?.itemCount ?? 0,
    );
  }

  private createPaginatedResponse(
    reqQuery: PaginationParamsDto,
    paginationData,
    itemCount: number,
  ) {
    const paginationMeta = new PaginationMetaDto(
      reqQuery.page,
      reqQuery.limit,
      itemCount,
    );
    const paginatedResponse: PaginatedResponseDto = {
      data: paginationData,
      meta: paginationMeta,
    };

    return paginatedResponse;
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

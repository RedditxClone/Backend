import type { PipeTransform } from '@nestjs/common';
import { BadRequestException, Global, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

@Global()
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
  public transform(value: any): Types.ObjectId {
    if (Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }

    throw new BadRequestException(`${value} is not a valid MongoId`);
  }
}

export const excludeFields = (obj: any, fields: string[]) => {
  const myObj: any = { ...obj };

  for (const field of fields) {
    delete myObj[field];
  }

  return myObj;
};

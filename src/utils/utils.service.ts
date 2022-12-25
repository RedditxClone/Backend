import type { PipeTransform } from '@nestjs/common';
import { BadRequestException, Global, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
/**
 * parse pipe for object id
 */
@Global()
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
  /**
   * transforms objects to object ids
   * @param value the object to be parsed
   * @returns object id
   */
  public transform(value: any): Types.ObjectId {
    if (Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }

    throw new BadRequestException(`${value} is not a valid MongoId`);
  }
}

/**
 * removes a field from object
 * @param obj the object to exclude from
 * @param fields the filed to be excluded
 * @returns new filtered object
 */
export const excludeFields = (obj: any, fields: string[]) => {
  const myObj: any = { ...obj };

  for (const field of fields) {
    delete myObj[field];
  }

  return myObj;
};

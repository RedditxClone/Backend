import {
  BadRequestException,
  Global,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Global()
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
  public transform(value: any): Types.ObjectId {
    if (Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    } else {
      throw new BadRequestException(`${value} is not a valid MongoId`);
    }
  }
}

export const excludeFields = (obj: any, fields: string[]) => {
  const myObj: any = { ...obj };
  fields.forEach((field) => delete myObj[field]);
  console.log(myObj);
  return myObj;
};

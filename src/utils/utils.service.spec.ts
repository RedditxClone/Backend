import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

import { excludeFields, ParseObjectIdPipe } from './utils.service';

describe('UtilsService', () => {
  it('should be defined', () => {
    expect(ParseObjectIdPipe).toBeDefined();
    expect(excludeFields).toBeDefined();
  });

  const parsePipe = new ParseObjectIdPipe();
  it('should parse id successfully', () => {
    const id = new Types.ObjectId('63a341dd1ac89af4d9eaea40');
    expect(parsePipe.transform('63a341dd1ac89af4d9eaea40')).toStrictEqual(id);
  });

  it('should throw while parsing id', () => {
    expect(() => parsePipe.transform('156')).toThrow(BadRequestException);
  });
  it('should remove field', () => {
    let obj = { field1: 'test', field2: 5, field3: true };
    obj = excludeFields(obj, ['field2', 'field3']);
    expect(obj.field2).toBeUndefined();
    expect(obj.field3).toBeUndefined();
    expect(obj.field1).toBeDefined();
  });
});

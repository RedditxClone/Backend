import { HttpException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';

export const throwGeneralException = (err: any) => {
  throw new HttpException(
    err.message || 'something went wrong',
    err.status || err.statusCode || 400,
  );
};

export const throwIfNullObject = (object: any, message?: string) => {
  if (object == null)
    throw new BadRequestException(message || 'something went wrong');
  return object;
};

import { HttpException } from '@nestjs/common';

export const throwGeneralException = (err: any) => {
  throw new HttpException(
    err.message || 'something went wrong',
    err.status || 500,
  );
};

import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.BAD_REQUEST;

    const httpResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let responeseBody;

    if (httpResponse instanceof Object) {
      responeseBody = httpResponse;
    }

    response.status(status).json({
      ...responeseBody,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

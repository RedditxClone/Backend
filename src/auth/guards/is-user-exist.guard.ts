import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import JWT from 'jsonwebtoken';
import { Types } from 'mongoose';
import type { Observable } from 'rxjs';

@Injectable()
export class IsUserExistGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    if (!req.headers.authorization) {
      return true;
    }

    const token = req.headers.authorization.split(' ')[1];

    const { id, username } = JWT.verify(
      token,
      process.env.JWT_SECRET ?? '',
    ) as {
      id: string;
      username: string;
    };
    req._id = new Types.ObjectId(id);
    req.user = { _id: req._id, username };

    return true;
  }
}

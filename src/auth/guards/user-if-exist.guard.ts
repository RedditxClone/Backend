import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JWTUserIfExistGuard extends AuthGuard('jwt-user-if-exist') {}

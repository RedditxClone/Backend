import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
/**
 * guest user guard class
 */
@Injectable()
export class JWTUserIfExistGuard extends AuthGuard('jwt-user-if-exist') {}

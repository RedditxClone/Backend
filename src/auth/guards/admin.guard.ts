import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
/**
 * admin user guard class
 */
@Injectable()
export class JWTAdminGuard extends AuthGuard('jwt-admin') {}

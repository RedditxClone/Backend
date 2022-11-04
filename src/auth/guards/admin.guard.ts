import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JWTAdminGuard extends AuthGuard('jwt-admin') {}

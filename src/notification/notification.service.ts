import { Injectable } from '@nestjs/common';
@Injectable()
export class NotificationService {
  findAll() {
    return `This action returns all notification`;
  }
}

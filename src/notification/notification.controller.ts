import { Controller, Get } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { GetNotificationDto } from './dto/notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOkResponse({
    description: 'all notifications has been returned successfully',
    type: [GetNotificationDto],
  })
  @ApiOperation({ description: 'get all notifcations for current user' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @ApiOperation({ description: 'get all unread notifications' })
  @ApiOkResponse({
    description: 'all unread notifications has been returned successfully',
    type: [GetNotificationDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Get('/unread')
  findUnread() {
    return this.notificationService.findAll();
  }

  @ApiOperation({ description: 'get all mentions for current user' })
  @ApiOkResponse({
    description: 'all mentions has been returned successfully',
    type: [GetNotificationDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Get('/mention')
  findMentions() {
    return {
      mentions: [],
    };
  }

  @ApiOperation({ description: 'get all unread mentions for current user' })
  @ApiOkResponse({
    description: 'all unread mentions has been returned successfully',
    type: [GetNotificationDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Get('/mention/unread')
  findUnreadMentions() {
    // return {
    //   mentions: [],
    // };
  }
}

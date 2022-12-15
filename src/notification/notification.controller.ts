import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

import { User } from '../auth/decorators/user.decorator';
import { JWTUserGuard } from '../auth/guards';
import { ApiPaginatedOkResponse } from '../utils/apiFeatures/decorators/api-paginated-ok-response.decorator';
import { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { CountNotificationDto } from './dto/count.dto';
import { GetNotificationDto } from './dto/notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiPaginatedOkResponse(
    GetNotificationDto,
    'all notifications has been returned successfully',
  )
  @ApiOperation({ description: 'get all notifications for current user' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Get()
  findAll(
    @User('_id') userId: Types.ObjectId,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.notificationService.findAll(userId, paginationParams);
  }

  @ApiOkResponse({
    description: 'return number of new notifications for current user',
    type: CountNotificationDto,
  })
  @ApiOperation({ description: 'get all notifications for current user' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Get('/count')
  findCount(@User('_id') userId: Types.ObjectId) {
    return this.notificationService.countNew(userId);
  }
  // @ApiOperation({ description: 'Mark Notification as read notifications' })
  // @ApiOkResponse({
  //   description: 'Notification is marked successfully',
  //   type: [GetNotificationDto],
  // })
  // @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  // @Get('/mark-unread')
  // findUnread() {
  //   return this.notificationService.findAll();
  // }

  // @ApiOperation({ description: 'get all mentions for current user' })
  // @ApiOkResponse({
  //   description: 'all mentions has been returned successfully',
  //   type: [GetNotificationDto],
  // })
  // @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  // @Get('/mention')
  // findMentions() {
  //   return {
  //     mentions: [],
  //   };
  // }

  // @ApiOperation({ description: 'get all unread mentions for current user' })
  // @ApiOkResponse({
  //   description: 'all unread mentions has been returned successfully',
  //   type: [GetNotificationDto],
  // })
  // @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  // @Get('/mention/unread')
  // findUnreadMentions() {
  //   return {
  //     mentions: [],
  //   };
  // }
}

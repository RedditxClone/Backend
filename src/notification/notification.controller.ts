import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

import { User } from '../auth/decorators/user.decorator';
import { JWTUserGuard } from '../auth/guards';
import { MessageIdListDto, ModifiedCountDto } from '../message/dto';
import { ApiPaginatedOkResponse } from '../utils/apiFeatures/decorators/api-paginated-ok-response.decorator';
import { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { ParseObjectIdPipe } from '../utils/utils.service';
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
  findCount(
    @User('_id') userId: Types.ObjectId,
    @User('username') username: string,
  ) {
    return this.notificationService.countNew(userId, username);
  }

  @ApiOperation({ description: 'Hides a notification makes it disappear.' })
  @ApiOkResponse({
    description: 'successfully hidden the notification',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Post(':notification_id/hide')
  hide(
    @Param('notification_id', ParseObjectIdPipe) notificationId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.notificationService.hide(userId, notificationId);
  }

  @ApiOperation({ description: 'Mark Notification as read notifications' })
  @ApiOkResponse({
    description: 'Notification is marked successfully',
    type: [ModifiedCountDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Post('/mark-as-read')
  markAsRead(
    @User('_id') userId: Types.ObjectId,
    @Body() messageIdList: MessageIdListDto,
  ) {
    return this.notificationService.markAsRead(userId, messageIdList);
  }
}

import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiForbiddenResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOkResponse({
    description: 'all notifications has been returned successfully',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @ApiOkResponse({
    description: 'all unread notifications has been returned successfully',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Get('/unread')
  findUnread() {
    return this.notificationService.findAll();
  }

  @ApiOkResponse({
    description: 'all mentions has been returned successfully',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Get('/mention')
  findMentions() {
    return {
      mentions: [],
    };
  }

  @ApiOkResponse({
    description: 'all unread mentions has been returned successfully',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Get('/mention/unread')
  findUnreadMentions() {
    return {
      mentions: [],
    };
  }
}

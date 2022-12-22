import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

import { User } from '../auth/decorators/user.decorator';
import { JWTUserGuard } from '../auth/guards';
import { ApiPaginatedOkResponse } from '../utils/apiFeatures/decorators/api-paginated-ok-response.decorator';
import { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { ParseObjectIdPipe } from '../utils/utils.service';
import {
  CreateMessageDto,
  MessageAggregationDto,
  MessageIdListDto,
  MessageReplyDto,
  ModifiedCountDto,
} from './dto';
import { MessageReturnDto } from './dto/message-return.dto';
import { MessageService } from './message.service';

@ApiTags('Messages')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiCreatedResponse({
    description: 'The messagess have been marked successfully',
    type: ModifiedCountDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthenticated' })
  @ApiOperation({ description: 'mark specific message as read' })
  @Post('/mark_as_read')
  @UseGuards(JWTUserGuard)
  markMessagesAsRead(
    @User('username') username: string,
    @Body() messageIdList: MessageIdListDto,
  ) {
    return this.messageService.markAsRead(username, messageIdList);
  }

  @ApiCreatedResponse({
    description: 'The messages have been marked successfully',
    type: ModifiedCountDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthenticated' })
  @ApiOperation({ description: 'mark specific message as read' })
  @Post('/mark_as_unread')
  @UseGuards(JWTUserGuard)
  markMessagesAsUnRead(
    @User('username') username: string,
    @Body() messageIdList: MessageIdListDto,
  ) {
    return this.messageService.markAsUnRead(username, messageIdList);
  }

  @ApiPaginatedOkResponse(
    MessageAggregationDto,
    'all messages have been returned successfully',
  )
  @ApiUnauthorizedResponse({ description: 'Unauthenticated Request' })
  @ApiOperation({
    description: 'Get all messages for current user',
  })
  @UseGuards(JWTUserGuard)
  @Get('/me')
  findAllForMe(
    @User('username') username: string,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.messageService.findAll(username, paginationParams);
  }

  @ApiPaginatedOkResponse(
    MessageAggregationDto,
    'all messages have been returned successfully',
  )
  @ApiUnauthorizedResponse({ description: 'Unauthenticated Request' })
  @ApiOperation({
    description: 'Get all post reply messages for current user',
  })
  @UseGuards(JWTUserGuard)
  @Get('/me/post')
  findAllPostForMe(
    @User('username') username: string,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.messageService.findAll(username, paginationParams, 'post');
  }

  @ApiPaginatedOkResponse(
    MessageAggregationDto,
    'all messages have been returned successfully',
  )
  @ApiUnauthorizedResponse({ description: 'Unauthenticated Request' })
  @ApiOperation({
    description: 'Get all post reply messages for current user',
  })
  @UseGuards(JWTUserGuard)
  @Get('/me/comment')
  findAllCommentForMe(
    @User('username') username: string,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.messageService.findAll(username, paginationParams, 'comment');
  }

  @ApiPaginatedOkResponse(
    MessageAggregationDto,
    'all messages have been returned successfully',
  )
  @ApiUnauthorizedResponse({ description: 'Unauthenticated Request' })
  @ApiOperation({
    description: 'Get all private messages for current user',
  })
  @UseGuards(JWTUserGuard)
  @Get('/me/message')
  findAllPMForMe(
    @User('username') username: string,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.messageService.findAll(username, paginationParams, 'msg');
  }

  @ApiPaginatedOkResponse(
    MessageAggregationDto,
    'all messages have been returned successfully',
  )
  @ApiUnauthorizedResponse({ description: 'Unauthenticated Request' })
  @ApiOperation({
    description: 'Get all unread messages for current user',
  })
  @UseGuards(JWTUserGuard)
  @Get('/me/unread')
  findAllUnreadForMe(
    @User('username') username: string,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.messageService.findAll(username, paginationParams, 'unread');
  }

  @ApiPaginatedOkResponse(
    MessageAggregationDto,
    'all messages have been returned successfully',
  )
  @ApiUnauthorizedResponse({ description: 'Unauthenticated Request' })
  @ApiOperation({
    description: 'Get all sent private messages for current user',
  })
  @UseGuards(JWTUserGuard)
  @Get('/me/sent')
  findAllSentForMe(
    @User('username') username: string,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.messageService.findAll(username, paginationParams, 'sent');
  }

  @ApiCreatedResponse({
    description: 'The message was created successfully',
    type: MessageReturnDto,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({
    description: 'Unauthorized Request. Cannot send message to this user',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthenticated Request' })
  @ApiNotFoundResponse({ description: 'User not Found' })
  @ApiOperation({ description: 'Send a private message to a user' })
  @UseGuards(JWTUserGuard)
  @Post('/:user_name')
  async send(
    @Body() createMessageDto: CreateMessageDto,
    @User('username') authorName: string,
    @User('_id') authorId: Types.ObjectId,
    @Param('user_name') destName: string,
  ): Promise<MessageReturnDto> {
    return this.messageService.sendPrivateMessage(
      createMessageDto,
      authorName,
      authorId,
      destName,
    );
  }

  @ApiCreatedResponse({
    description: 'Reply to an existing message',
    type: MessageReturnDto,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({
    description: 'Unauthorized Request. Cannot send message to this user',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthenticated Request' })
  @ApiNotFoundResponse({ description: 'Parent Message Or User Not Found' })
  @ApiOperation({ description: 'Reply to a private message' })
  @UseGuards(JWTUserGuard)
  @Post('/:message_id/reply')
  async reply(
    @Body() messageReplyDto: MessageReplyDto,
    @User('username') authorName: string,
    @User('_id') authorId: Types.ObjectId,
    @Param('message_id', ParseObjectIdPipe) messageId: Types.ObjectId,
  ): Promise<MessageReturnDto> {
    return this.messageService.replyToPrivateMessage(
      messageReplyDto,
      authorName,
      authorId,
      messageId,
    );
  }

  @ApiOkResponse({ description: 'The message has been spam successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthenticaed' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiOperation({ description: 'Report specific message with message_id' })
  @UseGuards(JWTUserGuard)
  @Post('/:message_id/spam')
  spamMessage(
    @User('username') username: string,
    @Param('message_id', ParseObjectIdPipe) messageId: Types.ObjectId,
  ) {
    return this.messageService.spam(username, messageId);
  }

  @ApiOkResponse({ description: 'The message has been deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthenticaed' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiOperation({ description: 'Delete specific message with message_id' })
  @UseGuards(JWTUserGuard)
  @Delete('/:message_id')
  remove(
    @User('username') authorName: string,
    @Param('message_id', ParseObjectIdPipe) messageId: Types.ObjectId,
  ) {
    return this.messageService.delete(authorName, messageId);
  }

  @ApiOkResponse({
    description: 'The resource was returned successfully',
    type: MessageReturnDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthenticated Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiOperation({ description: 'Get specific message with message_id' })
  @UseGuards(JWTUserGuard)
  @Get('/:message_id')
  findOne(
    @User('username') username: string,
    @Param('message_id', ParseObjectIdPipe) messageId: Types.ObjectId,
  ): Promise<MessageReturnDto> {
    return this.messageService.findOne(username, messageId);
  }
}

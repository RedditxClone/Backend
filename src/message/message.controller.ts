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
import { CreateMessageDto, MessageReplyDto } from './dto';
import { GetMessagesDto } from './dto/get-message.dto';
import { MessageReturnDto } from './dto/message-return.dto';
import { MessageService } from './message.service';

@ApiTags('Messages')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiCreatedResponse({
    description: 'The message was created successfully',
    type: MessageReturnDto,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthenticated Request' })
  @ApiNotFoundResponse({ description: 'Not Found' })
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
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthenticated Request' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOperation({ description: 'Reply to a private message' })
  @UseGuards(JWTUserGuard)
  @Post('/:message_id/reply')
  async reply(
    @Body() messageReplyDto: MessageReplyDto,
    @User('username') authorName: string,
    @User('_id') authorId: Types.ObjectId,
    @Param('message_id') messageId: Types.ObjectId,
  ): Promise<MessageReturnDto> {
    return this.messageService.replyToPrivateMessage(
      messageReplyDto,
      authorName,
      authorId,
      messageId,
    );
  }

  @ApiOkResponse({ description: 'The message has been deleted successfully' })
  @ApiUnauthorizedResponse({
    description: 'Unauthenticaed',
  })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiOperation({ description: 'delete specific message with message_id' })
  @UseGuards(JWTUserGuard)
  @Delete('/:message_id')
  remove(
    @User('username') authorName: string,
    @Param('message_id') messageId: Types.ObjectId,
  ) {
    return this.messageService.delete(authorName, messageId);
  }

  @ApiCreatedResponse({ description: 'The message spammed successfully' })
  @ApiUnauthorizedResponse({ description: "you haven't receive this message" })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiOperation({ description: 'spam a message' })
  @Post('/:message_id/spam')
  spamMessage(@Param('message_id') _messageId: string) {
    return { status: 'success' };
  }

  // @ApiOkResponse({
  //   description: 'all messages have been returned successfully',
  //   type: [MessageReturnDto],
  // })
  // @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  // @ApiNotFoundResponse({ description: 'user_id not found not found' })
  // @ApiOperation({ description: 'get all message of a user of user_id' })
  // @Get('/user/:user_id')
  // findAllForUser(@Param('user_id') _userId: string) {
  //   return this.messageService.findAll();
  // }

  // @ApiOkResponse({
  //   description: 'all messages have been returned successfully',
  //   type: [MessageReturnDto],
  // })
  // @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  // @ApiNotFoundResponse({ description: 'user_id not found' })
  // @ApiOperation({ description: 'get all messages sent by user with user_id' })
  // @Get('/user/:user_id/sent')
  // findSentByUser(@Param('user_id') _userId: string) {
  //   return {
  //     status: 'success',
  //     messages: [],
  //   };
  // }

  @ApiOkResponse({
    description: 'all messages have been returned successfully',
    type: [MessageReturnDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'user_id not found not found' })
  @ApiOperation({
    description: 'get all messages received by user with user_id',
  })
  @Get('/user/:user_id/received')
  findReceivedByUser(@Param('user_id') _userId: string) {
    // return {
    //   status: 'success',
    //   messages: [],
    // };
  }

  @ApiOkResponse({
    description: 'all messages have been returned successfully',
    type: [MessageReturnDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiOperation({
    description: 'get all messages sent|received by current user',
  })
  @ApiNotFoundResponse({ description: 'user_id not found not found' })
  @Get('/me')
  findAllForMe(@Query() _dto: GetMessagesDto) {
    return this.messageService.findAll();
  }

  @ApiOkResponse({
    description: 'all messages have been returned successfully',
    type: [MessageReturnDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'user_id not found not found' })
  @Get('/me/sent')
  @ApiOperation({
    description: 'get all messages sent by current user',
  })
  findAllSentByMe(@Query() _dto: GetMessagesDto) {
    // return {
    //   status: 'success',
    //   messages: [],
    // };
  }

  @ApiOkResponse({
    description: 'all messages have been returned successfully',
    type: [MessageReturnDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'user_id not found not found' })
  @ApiOperation({
    description: 'get all messages received by current user',
  })
  @Get('/me/received')
  findReceivedByMe(@Query() _dto: GetMessagesDto) {
    // return {
    //   status: 'success',
    //   messages: [],
    // };
  }

  @ApiCreatedResponse({
    description: 'The message has been marked successfully',
    type: [MessageReturnDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiOperation({ description: 'mark specific message as read' })
  @Post('/:message_id/mark_as_read')
  makeMessagesAsRead(@Param('message_id') _messageId: string) {
    return { status: 'success' };
  }

  @ApiOkResponse({
    description: 'The resource was returned successfully',
    type: MessageReturnDto,
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiOperation({ description: 'get specific message with message_id' })
  @Get('/:message_id')
  findOne(@Param('message_id') id: string) {
    return this.messageService.findOne(Number(id));
  }
}

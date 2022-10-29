import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { GetMessagesDto } from './dto/get-message.dto';
import { MessageReturnDto } from './dto/messageReturnDto';

@ApiTags('Messages')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiCreatedResponse({ description: 'The message was created successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiOperation({ description: 'send a message' })
  @Post('/:user_id')
  create(
    @Body() createMessageDto: CreateMessageDto,
    @Param('user_id') user_id: string,
  ) {
    return this.messageService.create(createMessageDto);
  }

  @ApiCreatedResponse({ description: 'The message spammed successfully' })
  @ApiUnauthorizedResponse({ description: "you haven't receive this message" })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiOperation({ description: 'spam a message' })
  @Post('/:message_id/spam')
  spamMessage(@Param('message_id') message_id: string) {
    return { status: 'success' };
  }

  @ApiOkResponse({
    description: 'all messages have been returned successfully',
    type: [MessageReturnDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'user_id not found not found' })
  @ApiOperation({ description: 'get all message of a user of user_id' })
  @Get('/user/:user_id')
  findAllForUser(@Param('user_id') user_id: string) {
    return this.messageService.findAll();
  }

  @ApiOkResponse({
    description: 'all messages have been returned successfully',
    type: [MessageReturnDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'user_id not found' })
  @ApiOperation({ description: 'get all messages sent by user with user_id' })
  @Get('/user/:user_id/sent')
  findSentByUser(@Param('user_id') user_id: string) {
    return {
      status: 'success',
      messages: [],
    };
  }

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
  findReceivedByUser(@Param('user_id') user_id: string) {
    return {
      status: 'success',
      messages: [],
    };
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
  findAllForMe(@Query() dto: GetMessagesDto) {
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
  findAllSentByMe(@Query() dto: GetMessagesDto) {
    return {
      status: 'success',
      messages: [],
    };
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
  findReceivedByMe(@Query() dto: GetMessagesDto) {
    return {
      status: 'success',
      messages: [],
    };
  }

  @ApiCreatedResponse({
    description: 'The message has been marked successfully',
    type: [MessageReturnDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiOperation({ description: 'mark specific message as read' })
  @Post('/:message_id/mark_as_read')
  makeMessagesAsRead(@Param('message_id') message_id: string) {
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
    return this.messageService.findOne(+id);
  }

  @ApiOkResponse({ description: 'The message has been deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnauthorizedResponse({
    description: "you haven't send|receive message with message_id",
  })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiOperation({ description: 'delete specific message with message_id' })
  @Delete('/:message_id')
  remove(@Param('message_id') id: string) {
    return this.messageService.remove(+id);
  }
}

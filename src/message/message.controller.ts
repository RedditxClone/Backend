import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { GetMessagesDto } from './dto/get-message.dto';

@ApiTags('Messages')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiCreatedResponse({ description: 'The message was created successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @ApiCreatedResponse({ description: 'The message spammed successfully' })
  @ApiUnauthorizedResponse({ description: "you haven't receive this message" })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/:message_id/spam')
  spamMessage() {
    return { status: 'success' };
  }

  @ApiOkResponse({
    description: 'all messages have been returned successfully',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'user_id not found not found' })
  @Get('/user/:user_id')
  findAllForUser() {
    return this.messageService.findAll();
  }

  @ApiOkResponse({
    description: 'all messages have been returned successfully',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'user_id not found not found' })
  @Get('/user/:user_id/sent')
  findSentByUser() {
    return {
      status: 'success',
      messages: [],
    };
  }

  @ApiOkResponse({
    description: 'all messages have been returned successfully',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'user_id not found not found' })
  @Get('/user/:user_id/received')
  findReceivedByUser() {
    return {
      status: 'success',
      messages: [],
    };
  }

  @ApiOkResponse({
    description: 'all messages have been returned successfully',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'user_id not found not found' })
  @Get('/me')
  findAllForMe(@Param() dto: GetMessagesDto) {
    return this.messageService.findAll();
  }

  @ApiOkResponse({
    description: 'all messages have been returned successfully',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'user_id not found not found' })
  @Get('/me/sent')
  findAllSentByMe(@Param() dto: GetMessagesDto) {
    return {
      status: 'success',
      messages: [],
    };
  }

  @ApiOkResponse({
    description: 'all messages have been returned successfully',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'user_id not found not found' })
  @Get('/me/received')
  findReceivedByMe(@Param() dto: GetMessagesDto) {
    return {
      status: 'success',
      messages: [],
    };
  }

  @Post('/:message_id/make_as_read')
  makeMessagesAsRead() {
    return { status: 'success' };
  }

  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Get(':message_id')
  findOne(@Param('message_id') id: string) {
    return this.messageService.findOne(+id);
  }

  @ApiOkResponse({ description: 'The message has been deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnauthorizedResponse({
    description: "you haven't send|receive message with message_id",
  })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Delete(':message_id')
  remove(@Param('message_id') id: string) {
    return this.messageService.remove(+id);
  }
}

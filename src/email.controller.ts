import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { EmailService } from './utils/mail.service';
import { Response } from 'express';
@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}
  @Get('plain-text-email')
  async plainTextEmail(@Res() res: Response) {
    const toMail = 'medoking91@gmail.com';
    const subject = 'Plain Text Email ✔';
    const body = 'Welcome NestJS Email Sending Tutorial';
    res.status(await this.emailService.sendEmail(toMail, subject, body)).send();
  }
}

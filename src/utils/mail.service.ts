import { MailerService } from '@nestjs-modules/mailer';
import { Global, HttpStatus, Injectable } from '@nestjs/common';

@Global()
@Injectable()
export class EmailService {
  constructor(private mailService: MailerService) {}
  async sendEmail(toMail: string, subject: string, body: string) {
    try {
      const response = await this.mailService.sendMail({
        to: toMail,
        from: process.env.EMAIL_USER,
        subject: subject,
        text: body,
      });
      console.log(response);
      return HttpStatus.OK;
    } catch (error) {
      console.log(error);
      return HttpStatus.UNAUTHORIZED;
    }
  }
}

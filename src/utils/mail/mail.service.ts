import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
/**
 * A utility class to send emails.
 */
export class EmailService {
  constructor(private mailService: MailerService) {}
  /**
   * A utility function to send emails with variable user email, subject, and body.
   *
   * @param toMail The user email that will be sent to.
   * @param subject The email subject.
   * @param body The email body.
   * @returns Status code OK if sent successfully otherwise UNAUTHORIZED
   */
  sendEmail = async (toMail: string, subject: string, body: string) => {
    try {
      return await this.mailService.sendMail({
        to: toMail,
        from: process.env.EMAIL_USER,
        subject: subject,
        text: body,
      });
    } catch (err) {
      throw new HttpException(
        err.message || 'Failed to send mail',
        HttpStatus.UNAUTHORIZED,
      );
    }
  };
}

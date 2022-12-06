import { HttpException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';

import { MailerServiceMock } from '../__mocks__/mailer.service';
import { EmailService } from './mail.service';
/**
 * Test for Mail Service
 */
describe('EmailService', () => {
  let service: EmailService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [EmailService, MailerService],
    })
      .overrideProvider(MailerService)
      .useValue(MailerServiceMock)
      .compile();
    service = module.get<EmailService>(EmailService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('sendMail', () => {
    test('should throw error', async () => {
      await expect(service.sendEmail('throw', 'a', 'a')).rejects.toThrow(
        HttpException,
      );
    });
    test('should send email normally', async () => {
      await expect(service.sendEmail('NotThrow', 'a', 'a')).resolves.toMatch(
        /.*OK.*/,
      );
    });
  });
});

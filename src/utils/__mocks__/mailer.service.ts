export const MailerServiceMock = {
  sendMail: (sendMailOptions: any) => {
    if (sendMailOptions.to === 'throw') throw new Error('Error while sending');
  },
};

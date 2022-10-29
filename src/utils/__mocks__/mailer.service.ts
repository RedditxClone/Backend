export const MailerServiceMock = {
  sendMail: (sendMailOptions: any) => {
    return new Promise(() => {
      if (sendMailOptions.to === 'throw') {
        throw new Error('Error while sending');
      }
    });
  },
};

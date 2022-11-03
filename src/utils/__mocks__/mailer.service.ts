export const MailerServiceMock = {
  sendMail: (sendMailOptions: any) => {
    return new Promise((resolve, reject) => {
      if (sendMailOptions.to === 'throw') {
        reject('Error while sending');
      } else resolve('OK');
    });
  },
};
